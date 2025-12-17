import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { 
  getConfig, 
  writeConfig, 
  getProjectInfo, 
  detectProjectType,
  DEFAULT_COMPONENTS,
  DEFAULT_UTILS,
  DEFAULT_TAILWIND_CONFIG,
  DEFAULT_TAILWIND_CSS
} from '../utils/config.js';
import { Config, InitOptions } from '../utils/types.js';
import { Logger } from '../utils/logger.js';
import { defaultRegistry } from '../utils/registry.js';

const logger = new Logger();

export async function init(options: InitOptions = {}) {
  const cwd = options.cwd || process.cwd();
  logger.info(`Initializing mario-charts in ${chalk.cyan(cwd)}`);
  
  // Verificar se já existe configuração
  const existingConfig = await getConfig(cwd);
  if (existingConfig && !options.yes) {
    const { overwrite } = await inquirer.prompt({
      type: 'confirm',
      name: 'overwrite',
      message: 'Configuration already exists. Do you want to overwrite it?',
      default: false,
    });
    
    if (!overwrite) {
      logger.info('Initialization cancelled.');
      return;
    }
  }

  // Detectar tipo de projeto
  const projectInfo = getProjectInfo(cwd);
  const projectType = await detectProjectType(cwd);
  
  if (!projectInfo.hasPackageJson) {
    logger.error('No package.json found. Please run this command in a valid Node.js project.');
    return;
  }
  
  if (!projectType?.hasReact) {
    logger.warn('React not detected in dependencies. Mario Charts requires React 18+');
  }

  let config: Config;

  if (options.defaults) {
    // Usar configuração padrão
    config = getDefaultConfig(projectType);
  } else {
    // Configuração interativa
    config = await promptForConfig(cwd, projectType, options.yes);
  }

  // Criar diretórios necessários
  const spinner = ora('Creating project structure...').start();
  
  try {
    const componentsDir = path.resolve(cwd, config.aliases.components.replace('@/', ''));
    const chartsDir = path.resolve(cwd, config.aliases.charts.replace('@/', ''));
    const uiDir = path.resolve(cwd, config.aliases.ui.replace('@/', ''));
    const utilsDir = path.dirname(path.resolve(cwd, config.aliases.utils.replace('@/', '')));

    await fs.ensureDir(componentsDir);
    await fs.ensureDir(chartsDir);
    await fs.ensureDir(uiDir);
    await fs.ensureDir(utilsDir);

    // Criar arquivo utils.ts se não existir
    const utilsPath = path.resolve(cwd, config.aliases.utils.replace('@/', '') + '.ts');
    if (!await fs.pathExists(utilsPath)) {
      await fs.writeFile(utilsPath, getUtilsContent());
    }

    // Criar arquivo hooks.ts se não existir
    const hooksPath = path.resolve(cwd, utilsDir, 'hooks.ts');
    if (!await fs.pathExists(hooksPath)) {
      await fs.writeFile(hooksPath, getHooksContent());
    }

    spinner.succeed('Project structure created');
  } catch (error) {
    spinner.fail('Failed to create project structure');
    throw error;
  }

  // Escrever configuração
  const configSpinner = ora('Writing configuration...').start();
  
  try {
    await writeConfig(cwd, config);
    configSpinner.succeed('Configuration saved');
  } catch (error) {
    configSpinner.fail('Failed to save configuration');
    throw error;
  }

  // Instalar dependências base se necessário
  if (projectType?.cssFramework !== 'tailwind') {
    logger.warn('Tailwind CSS not detected. Mario Charts requires Tailwind CSS for styling.');
    
    const { installTailwind } = await inquirer.prompt({
      type: 'confirm',
      name: 'installTailwind',
      message: 'Would you like to install and configure Tailwind CSS?',
      default: true,
    });

    if (installTailwind) {
      await installTailwindCSS(cwd);
    }
  }

  // Instalar componentes iniciais se especificados
  if (options.components && options.components.length > 0) {
    logger.info('Installing initial components...');
    const { addComponents } = await import('./add.js');
    await addComponents(options.components, { cwd, silent: true });
  }

  logger.break();
  logger.success('Mario Charts initialized successfully!');
  logger.break();
  logger.plain('Next steps:');
  logger.plain(`  1. ${chalk.cyan('npx mario-charts add bar-chart')} - Add your first chart component`);
  logger.plain(`  2. ${chalk.cyan('npx mario-charts list')} - Browse available components`);
  logger.plain(`  3. Visit ${chalk.blue('https://mariocharts.com')} for documentation`);
  logger.break();
}

function getDefaultConfig(projectType: any): Config {
  return {
    style: 'default',
    rsc: false,
    tsx: projectType?.isTypeScript ?? true,
    tailwind: {
      config: DEFAULT_TAILWIND_CONFIG,
      css: DEFAULT_TAILWIND_CSS,
      baseColor: 'slate',
      cssVariables: true,
      prefix: '',
    },
    aliases: {
      components: DEFAULT_COMPONENTS,
      utils: DEFAULT_UTILS,
      ui: '@/components/ui',
      charts: '@/components/charts',
      hooks: '@/hooks',
      types: '@/types',
      themes: '@/themes',
    },
  };
}

async function promptForConfig(cwd: string, projectType: any, skipConfirm?: boolean): Promise<Config> {
  const questions = [
    {
      type: 'input',
      name: 'componentsPath',
      message: 'Where would you like to add your components?',
      default: DEFAULT_COMPONENTS,
    },
    {
      type: 'input',
      name: 'utilsPath',
      message: 'Where is your utils file?',
      default: DEFAULT_UTILS,
    },
    {
      type: 'confirm',
      name: 'tsx',
      message: 'Would you like to use TypeScript (recommended)?',
      default: projectType?.isTypeScript ?? true,
    },
    {
      type: 'confirm',
      name: 'cssVariables',
      message: 'Would you like to use CSS variables for colors?',
      default: true,
    },
    {
      type: 'input',
      name: 'tailwindConfig',
      message: 'Where is your tailwind.config file?',
      default: projectType?.isTypeScript ? 'tailwind.config.ts' : 'tailwind.config.js',
    },
    {
      type: 'input',
      name: 'tailwindCss',
      message: 'Where is your global CSS file?',
      default: detectGlobalCSS(cwd),
    },
  ];

  if (!skipConfirm) {
    const answers = await inquirer.prompt(questions);
    
    return {
      style: 'default',
      rsc: false,
      tsx: answers.tsx,
      tailwind: {
        config: answers.tailwindConfig,
        css: answers.tailwindCss,
        baseColor: 'slate',
        cssVariables: answers.cssVariables,
        prefix: '',
      },
      aliases: {
        components: answers.componentsPath,
        utils: answers.utilsPath,
        ui: `${answers.componentsPath}/ui`,
        charts: `${answers.componentsPath}/charts`,
        hooks: '@/hooks',
        types: '@/types',
        themes: '@/themes',
      },
    };
  }

  return getDefaultConfig(projectType);
}

function detectGlobalCSS(cwd: string): string {
  const possiblePaths = [
    'app/globals.css',
    'src/app/globals.css',
    'styles/globals.css',
    'src/styles/globals.css',
    'src/index.css',
    'app.css',
  ];

  for (const cssPath of possiblePaths) {
    if (fs.existsSync(path.resolve(cwd, cssPath))) {
      return cssPath;
    }
  }

  return 'app/globals.css';
}

async function installTailwindCSS(cwd: string) {
  const spinner = ora('Installing Tailwind CSS...').start();
  
  try {
    await execa('npm', ['install', '-D', 'tailwindcss', 'postcss', 'autoprefixer'], { cwd });
    await execa('npx', ['tailwindcss', 'init', '-p'], { cwd });
    
    spinner.succeed('Tailwind CSS installed successfully');
  } catch (error) {
    spinner.fail('Failed to install Tailwind CSS');
    logger.error('Please install Tailwind CSS manually: https://tailwindcss.com/docs/installation');
  }
}

function getUtilsContent(): string {
  return `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
}

function getHooksContent(): string {
  return `import { useEffect, useLayoutEffect } from 'react';

/**
 * Isomorphic useLayoutEffect that falls back to useEffect on the server.
 * Use for DOM measurements that may run during SSR.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
`;
}