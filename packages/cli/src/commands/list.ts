import chalk from 'chalk';
import ora from 'ora';
import { Logger } from '../utils/logger.js';
import { defaultRegistry } from '../utils/registry.js';
import { RegistryItem } from '../utils/types.js';

const logger = new Logger();

export interface ListOptions {
  type?: string;
  search?: string;
  detailed?: boolean;
}

export async function list(options: ListOptions = {}) {
  const spinner = ora('Fetching available components...').start();
  
  try {
    let components: RegistryItem[];
    
    if (options.type) {
      components = await defaultRegistry.getComponentsByType(options.type as any);
      spinner.succeed(`Found ${components.length} ${options.type} components`);
    } else if (options.search) {
      components = await defaultRegistry.searchComponents(options.search);
      spinner.succeed(`Found ${components.length} components matching "${options.search}"`);
    } else {
      components = await defaultRegistry.getAllComponents();
      spinner.succeed(`Found ${components.length} available components`);
    }

    if (components.length === 0) {
      logger.info('No components found.');
      return;
    }

    displayComponents(components, options.detailed);
    
  } catch (error) {
    spinner.fail('Failed to fetch components');
    logger.error(error instanceof Error ? error.message : 'Unknown error');
  }
}

function displayComponents(components: RegistryItem[], detailed = false) {
  // Agrupar por tipo
  const groupedComponents = components.reduce((acc, component) => {
    if (!acc[component.type]) {
      acc[component.type] = [];
    }
    acc[component.type].push(component);
    return acc;
  }, {} as Record<string, RegistryItem[]>);

  logger.break();
  
  Object.entries(groupedComponents)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([type, comps]) => {
      logger.plain(`${chalk.bold.blue(type.charAt(0).toUpperCase() + type.slice(1))} (${comps.length})`);
      logger.break();
      
      if (detailed) {
        displayDetailedComponents(comps);
      } else {
        displaySimpleComponents(comps);
      }
      
      logger.break();
    });

  logger.plain(`${chalk.gray('Total:')} ${components.length} components available`);
  logger.break();
  logger.plain(`${chalk.gray('Usage:')} ${chalk.cyan('mario-charts add <component-name>')}`);
  logger.plain(`${chalk.gray('Example:')} ${chalk.cyan('mario-charts add bar-chart line-chart')}`);
}

function displaySimpleComponents(components: RegistryItem[]) {
  const maxNameLength = Math.max(...components.map(c => c.name.length));
  
  components
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(component => {
      const name = component.name.padEnd(maxNameLength);
      const description = component.description;
      const category = component.subcategory 
        ? `${component.category}/${component.subcategory}`
        : component.category;
      
      logger.plain(
        `  ${chalk.cyan(name)} ${chalk.gray('│')} ${description} ${chalk.gray(`(${category})`)}`
      );
    });
}

function displayDetailedComponents(components: RegistryItem[]) {
  components
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((component, index) => {
      if (index > 0) logger.break();
      
      logger.plain(`  ${chalk.bold.cyan(component.name)}`);
      logger.plain(`    ${chalk.gray('Description:')} ${component.description}`);
      logger.plain(`    ${chalk.gray('Category:')} ${component.category}${
        component.subcategory ? `/${component.subcategory}` : ''
      }`);
      
      if (component.dependencies.length > 0) {
        logger.plain(`    ${chalk.gray('Dependencies:')} ${component.dependencies.join(', ')}`);
      }
      
      if (component.registryDependencies.length > 0) {
        logger.plain(`    ${chalk.gray('Requires:')} ${component.registryDependencies.join(', ')}`);
      }
      
      const fileCount = component.files.length;
      const fileText = fileCount === 1 ? 'file' : 'files';
      logger.plain(`    ${chalk.gray('Files:')} ${fileCount} ${fileText}`);
      
      component.files.forEach(file => {
        logger.plain(`      - ${chalk.yellow(file.name)}`);
      });
    });
}

export async function listByType(type: string) {
  return list({ type });
}

export async function searchComponents(query: string) {
  return list({ search: query });
}