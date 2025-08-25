import path from 'path';
import fs from 'fs-extra';
import { cosmiconfig } from 'cosmiconfig';
import { Config, configSchema } from './types.js';
import { Logger } from './logger.js';

const logger = new Logger();

export const DEFAULT_COMPONENTS = '@/components';
export const DEFAULT_UTILS = '@/lib/utils';
export const DEFAULT_TAILWIND_CONFIG = 'tailwind.config.ts';
export const DEFAULT_TAILWIND_CSS = 'app/globals.css';

export async function getConfig(cwd: string): Promise<Config | null> {
  const explorer = cosmiconfig('mario-charts', {
    searchPlaces: [
      'mario-charts.json',
      '.mario-chartsrc',
      '.mario-chartsrc.json',
      'mario-charts.config.js',
      'mario-charts.config.ts',
    ],
  });

  try {
    const result = await explorer.search(cwd);
    
    if (!result) {
      return null;
    }

    return configSchema.parse(result.config);
  } catch (error) {
    logger.error(`Failed to load config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function resolveConfigPaths(cwd: string, config: Config) {
  // Resolver paths absolutos
  const resolvedConfig = { ...config };

  if (config.tailwind) {
    resolvedConfig.tailwind = {
      ...config.tailwind,
      config: path.resolve(cwd, config.tailwind.config),
      css: path.resolve(cwd, config.tailwind.css),
    };
  }

  return resolvedConfig;
}

export async function writeConfig(cwd: string, config: Config) {
  const configPath = path.resolve(cwd, 'mario-charts.json');
  
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return configPath;
  } catch (error) {
    logger.error(`Failed to write config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

export function getProjectInfo(cwd: string) {
  const packageJsonPath = path.resolve(cwd, 'package.json');
  const tsConfigPath = path.resolve(cwd, 'tsconfig.json');
  
  return {
    isTypeScript: fs.existsSync(tsConfigPath),
    hasPackageJson: fs.existsSync(packageJsonPath),
    packageJson: fs.existsSync(packageJsonPath) 
      ? fs.readJsonSync(packageJsonPath) 
      : null,
  };
}

export async function detectProjectType(cwd: string) {
  const { packageJson, isTypeScript } = getProjectInfo(cwd);
  
  if (!packageJson) {
    return null;
  }

  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Detectar framework
  let framework: string | null = null;
  if (deps.next) framework = 'next';
  else if (deps.vite) framework = 'vite';
  else if (deps['@remix-run/react']) framework = 'remix';
  
  // Detectar CSS framework
  let cssFramework: string | null = null;
  if (deps.tailwindcss) cssFramework = 'tailwind';
  
  return {
    framework,
    cssFramework,
    isTypeScript,
    hasReact: !!deps.react,
  };
}