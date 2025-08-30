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

// Security utilities for path validation
function sanitizeFileName(fileName: string): string {
  // Remove any path traversal attempts and dangerous characters
  return fileName
    .replace(/\.\./g, '') // Remove .. path traversal
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .toLowerCase();
}

function validatePath(targetPath: string, basePath: string): boolean {
  // Resolve both paths to absolute paths
  const resolvedTarget = path.resolve(targetPath);
  const resolvedBase = path.resolve(basePath);
  
  // Check if the target path is within the base path
  const relativePath = path.relative(resolvedBase, resolvedTarget);
  
  // If the relative path starts with .. or is an absolute path, it's outside the base
  return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

function isValidComponentType(componentType: string): boolean {
  const validTypes = ['chart', 'ui', 'layout', 'filter', 'primitive'];
  return validTypes.includes(componentType);
}

const logger = new Logger();

export async function addComponents(components: string[], options: AddOptions = {}) {
  const cwd = options.cwd || process.cwd();
  
  // Verificar se o projeto foi inicializado
  let config = await getConfig(cwd);
  if (!config) {
    // Auto-init like shadcn
    const { shouldInit } = await inquirer.prompt({
      type: 'confirm',
      name: 'shouldInit',
      message: 'You need to create a mario-charts.json file to add components. Proceed?',
      default: true,
    });

    if (!shouldInit) {
      logger.info('Installation cancelled.');
      return;
    }

    // Create default config
    const defaultConfig = {
      style: 'default',
      rsc: false,
      tsx: true,
      tailwind: {
        config: 'tailwind.config.ts',
        css: 'src/app/globals.css',
        baseColor: 'slate',
        cssVariables: true,
        prefix: '',
      },
      aliases: {
        components: '@/components',
        utils: '@/lib/utils',
        ui: '@/components/ui',
        charts: '@/components/charts',
      },
    };

    const configPath = path.join(cwd, 'mario-charts.json');
    await fs.writeJSON(configPath, defaultConfig, { spaces: 2 });
    logger.success('Created mario-charts.json');
    
    config = defaultConfig;
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
  // Security: Validate component type
  if (!isValidComponentType(componentType)) {
    throw new Error(`Invalid component type: ${componentType}`);
  }

  // Security: Sanitize filename to prevent path traversal
  const sanitizedFileName = sanitizeFileName(fileName);
  if (!sanitizedFileName || sanitizedFileName !== fileName.toLowerCase().replace(/[^a-z0-9\-]/g, '-')) {
    logger.warn(`Filename was sanitized from "${fileName}" to "${sanitizedFileName}"`);
  }

  // Detect if project uses src/ directory
  const usesSrcDir = fs.existsSync(path.join(cwd, 'src'));
  const srcPrefix = usesSrcDir ? 'src/' : '';

  // Resolve base path based on component type
  let basePath: string;
  switch (componentType) {
    case 'chart':
      basePath = config.aliases.charts.replace('@/', srcPrefix);
      break;
    case 'ui':
      basePath = config.aliases.ui.replace('@/', srcPrefix);
      break;
    case 'layout':
      basePath = config.aliases.components.replace('@/', srcPrefix) + '/layout';
      break;
    case 'filter':
      basePath = config.aliases.components.replace('@/', srcPrefix) + '/filters';
      break;
    case 'primitive':
      basePath = config.aliases.components.replace('@/', srcPrefix) + '/primitives';
      break;
    default:
      basePath = config.aliases.components.replace('@/', srcPrefix);
  }

  // Security: Ensure basePath is clean
  basePath = path.normalize(basePath);
  
  // Create the target path
  const targetPath = path.resolve(cwd, basePath, sanitizedFileName);
  
  // Security: Validate that the resolved path is within the project directory
  const projectRoot = path.resolve(cwd);
  if (!validatePath(targetPath, projectRoot)) {
    throw new Error(`Security violation: Path ${targetPath} is outside project directory ${projectRoot}`);
  }

  // Security: Additional check - ensure we're not writing to system directories
  const resolvedBasePath = path.resolve(cwd, basePath);
  if (!validatePath(targetPath, resolvedBasePath)) {
    throw new Error(`Security violation: Path ${targetPath} is outside intended directory ${resolvedBasePath}`);
  }

  return targetPath;
}

function getComponentImportPath(component: any, config: any): string {
  const alias = config.aliases.charts;
  return `${alias}/${component.name}`;
}

// Função auxiliar para o comando CLI
export async function add(components: string[], options: AddOptions = {}) {
  return addComponents(components, options);
}