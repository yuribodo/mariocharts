import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { createPatch } from 'diff';
import { getConfig, resolveConfigPaths } from '../utils/config.js';
import { AddOptions } from '../utils/types.js';
import { Logger } from '../utils/logger.js';
import { defaultRegistry } from '../utils/registry.js';

const logger = new Logger();

export async function addComponents(components: string[], options: AddOptions = {}) {
  const cwd = options.cwd || process.cwd();
  
  // Verificar se o projeto foi inicializado
  const config = await getConfig(cwd);
  if (!config) {
    logger.error('Mario Charts not initialized. Run `mario-charts init` first.');
    return;
  }

  const resolvedConfig = await resolveConfigPaths(cwd, config);

  // Se --all foi especificado, buscar todos os componentes
  if (options.all) {
    const spinner = ora('Fetching available components...').start();
    try {
      const allComponents = await defaultRegistry.getAllComponents();
      components = allComponents.map(c => c.name);
      spinner.succeed(`Found ${components.length} components`);
    } catch (error) {
      spinner.fail('Failed to fetch components');
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      return;
    }
  }

  if (!components.length) {
    logger.error('No components specified. Use `mario-charts add <component>` or `mario-charts add --all`');
    return;
  }

  // Resolver dependências
  const spinner = ora('Resolving dependencies...').start();
  let resolved;
  
  try {
    resolved = await defaultRegistry.resolveDependencies(components);
    spinner.succeed(`Resolved ${resolved.resolved.length} components with dependencies`);
  } catch (error) {
    spinner.fail('Failed to resolve dependencies');
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    return;
  }

  // Mostrar o que será instalado
  logger.break();
  logger.info('The following components will be added:');
  
  const componentsByType = resolved.resolved.reduce((acc, component) => {
    if (!acc[component.type]) acc[component.type] = [];
    acc[component.type].push(component);
    return acc;
  }, {} as Record<string, typeof resolved.resolved>);

  Object.entries(componentsByType).forEach(([type, comps]) => {
    logger.plain(`  ${chalk.bold(type.charAt(0).toUpperCase() + type.slice(1))}:`);
    comps.forEach(comp => {
      logger.plain(`    - ${chalk.cyan(comp.name)}: ${comp.description}`);
    });
  });

  if (resolved.npmDependencies.length > 0) {
    logger.break();
    logger.info('The following npm packages will be installed:');
    resolved.npmDependencies.forEach(dep => {
      logger.plain(`  - ${chalk.yellow(dep)}`);
    });
  }

  // Confirmar instalação
  if (!options.skipConfirm) {
    logger.break();
    const { proceed } = await inquirer.prompt({
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with installation?',
      default: true,
    });

    if (!proceed) {
      logger.info('Installation cancelled.');
      return;
    }
  }

  // Instalar dependências npm
  if (resolved.npmDependencies.length > 0) {
    const npmSpinner = ora('Installing npm dependencies...').start();
    try {
      await execa('npm', ['install', ...resolved.npmDependencies], { 
        cwd,
        stdio: options.silent ? 'pipe' : 'inherit'
      });
      npmSpinner.succeed('npm dependencies installed');
    } catch (error) {
      npmSpinner.fail('Failed to install npm dependencies');
      logger.error('Please install the dependencies manually:');
      logger.plain(`npm install ${resolved.npmDependencies.join(' ')}`);
    }
  }

  // Instalar componentes
  const installResults = [];
  
  for (let i = 0; i < resolved.resolved.length; i++) {
    const component = resolved.resolved[i];
    const spinner = ora(`Installing ${component.name} (${i + 1}/${resolved.resolved.length})...`).start();
    
    try {
      const result = await installComponent(component, resolvedConfig, cwd, options);
      installResults.push({ component: component.name, result });
      
      if (result.created) {
        spinner.succeed(`${component.name} installed`);
      } else if (result.updated) {
        spinner.succeed(`${component.name} updated`);
      } else if (result.skipped) {
        spinner.succeed(`${component.name} skipped (already exists)`);
      }
    } catch (error) {
      spinner.fail(`Failed to install ${component.name}`);
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      installResults.push({ component: component.name, result: { error: true } });
    }
  }

  // Resumo da instalação
  logger.break();
  const created = installResults.filter(r => r.result.created).length;
  const updated = installResults.filter(r => r.result.updated).length;
  const skipped = installResults.filter(r => r.result.skipped).length;
  const errors = installResults.filter(r => r.result.error).length;

  if (created > 0) logger.success(`${created} component(s) installed`);
  if (updated > 0) logger.success(`${updated} component(s) updated`);
  if (skipped > 0) logger.info(`${skipped} component(s) skipped`);
  if (errors > 0) logger.error(`${errors} component(s) failed`);

  logger.break();
  logger.success('Installation complete!');
  
  // Mostrar exemplos de uso
  const mainComponents = resolved.resolved.filter(c => 
    components.includes(c.name) && c.type === 'chart'
  );
  
  if (mainComponents.length > 0) {
    logger.break();
    logger.info('Example usage:');
    mainComponents.slice(0, 2).forEach(component => {
      const importPath = getComponentImportPath(component, resolvedConfig);
      logger.plain(`  ${chalk.gray('import')} { ${component.meta?.exportName || component.name} } ${chalk.gray('from')} '${chalk.cyan(importPath)}';`);
    });
  }
}

async function installComponent(
  component: any,
  config: any,
  cwd: string,
  options: AddOptions
) {
  const results = { created: false, updated: false, skipped: false, error: false };

  for (const file of component.files) {
    const targetPath = resolveComponentPath(file.name, component.type, config, cwd);
    const targetDir = path.dirname(targetPath);
    
    // Criar diretório se não existir
    await fs.ensureDir(targetDir);
    
    const existingContent = await fs.pathExists(targetPath) 
      ? await fs.readFile(targetPath, 'utf8')
      : null;

    if (existingContent && !options.overwrite) {
      // Mostrar diff se o conteúdo for diferente
      if (existingContent !== file.content) {
        logger.warn(`Component ${component.name} already exists at ${path.relative(cwd, targetPath)}`);
        
        const patches = createPatch(
          file.name,
          existingContent,
          file.content,
          'existing',
          'new'
        );
        
        if (patches.trim() !== 'Index: ' + file.name) {
          logger.plain('Changes to be made:');
          console.log(patches);
          
          const { overwrite } = await inquirer.prompt({
            type: 'confirm',
            name: 'overwrite',
            message: `Overwrite ${file.name}?`,
            default: false,
          });
          
          if (overwrite) {
            await fs.writeFile(targetPath, file.content);
            results.updated = true;
          } else {
            results.skipped = true;
          }
        } else {
          results.skipped = true;
        }
      } else {
        results.skipped = true;
      }
    } else {
      // Criar ou sobrescrever arquivo
      await fs.writeFile(targetPath, file.content);
      if (existingContent) {
        results.updated = true;
      } else {
        results.created = true;
      }
    }
  }

  return results;
}

function resolveComponentPath(fileName: string, componentType: string, config: any, cwd: string): string {
  let basePath: string;

  switch (componentType) {
    case 'chart':
      basePath = config.aliases.charts.replace('@/', '');
      break;
    case 'ui':
      basePath = config.aliases.ui.replace('@/', '');
      break;
    case 'layout':
      basePath = config.aliases.components.replace('@/', '') + '/layout';
      break;
    case 'filter':
      basePath = config.aliases.components.replace('@/', '') + '/filters';
      break;
    case 'primitive':
      basePath = config.aliases.components.replace('@/', '') + '/primitives';
      break;
    default:
      basePath = config.aliases.components.replace('@/', '');
  }

  return path.resolve(cwd, basePath, fileName);
}

function getComponentImportPath(component: any, config: any): string {
  const alias = config.aliases.charts;
  return `${alias}/${component.name}`;
}

// Função auxiliar para o comando CLI
export async function add(components: string[], options: AddOptions = {}) {
  return addComponents(components, options);
}