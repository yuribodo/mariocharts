#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { list } from './commands/list.js';
import { Logger } from './utils/logger.js';

const logger = new Logger();
const program = new Command();

// Configuração do programa principal
program
  .name('mario-charts')
  .description('CLI for Mario Charts - Modern React component library for charts and dashboards')
  .version('0.1.0')
  .configureHelp({
    sortSubcommands: true,
  });

// Comando init
program
  .command('init')
  .description('Initialize Mario Charts in your project')
  .option('-y, --yes', 'skip confirmation prompts and use defaults')
  .option('--defaults', 'use default configuration without prompts')
  .option('-c, --cwd <path>', 'the working directory', process.cwd())
  .option('--components <components...>', 'components to install during initialization')
  .action(async (options) => {
    try {
      await init(options);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Unknown error occurred during initialization');
      process.exit(1);
    }
  });

// Comando add
program
  .command('add')
  .description('Add components to your project')
  .argument('[components...]', 'the components to add')
  .option('-y, --yes', 'skip confirmation prompts')
  .option('-o, --overwrite', 'overwrite existing files')
  .option('-c, --cwd <path>', 'the working directory', process.cwd())
  .option('-a, --all', 'add all available components')
  .option('--path <path>', 'the path to add the components to')
  .option('--silent', 'run in silent mode')
  .action(async (components, options) => {
    try {
      if (!components.length && !options.all) {
        logger.error('Please specify components to add or use --all flag');
        logger.plain('Example: mario-charts add bar-chart line-chart');
        logger.plain('         mario-charts add --all');
        process.exit(1);
      }

      await add(components, {
        ...options,
        skipConfirm: options.yes,
      });
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Unknown error occurred while adding components');
      process.exit(1);
    }
  });

// Comando list
program
  .command('list')
  .description('List all available components')
  .option('-t, --type <type>', 'filter by component type (chart, ui, layout, filter, primitive)')
  .option('-s, --search <query>', 'search components by name or description')
  .option('-d, --detailed', 'show detailed information about components')
  .action(async (options) => {
    try {
      await list(options);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Unknown error occurred while listing components');
      process.exit(1);
    }
  });

// Comando diff (para futuro)
program
  .command('diff')
  .description('Show diff between local and registry components')
  .argument('[components...]', 'the components to diff')
  .option('-c, --cwd <path>', 'the working directory', process.cwd())
  .action(async (components, options) => {
    logger.warn('diff command is not yet implemented');
  });

// Comando update (para futuro)
program
  .command('update')
  .description('Update components to latest versions')
  .argument('[components...]', 'the components to update')
  .option('-a, --all', 'update all components')
  .option('-y, --yes', 'skip confirmation prompts')
  .option('-c, --cwd <path>', 'the working directory', process.cwd())
  .action(async (components, options) => {
    logger.warn('update command is not yet implemented');
  });

// Tratamento de erros globais
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Handler para SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.plain('\\n');
  logger.info('Operation cancelled by user');
  process.exit(0);
});

// Handler para comandos não reconhecidos
program.on('command:*', (operands) => {
  logger.error(`Unknown command: ${operands[0]}`);
  logger.plain(`Available commands: ${program.commands.map(cmd => cmd.name()).join(', ')}`);
  process.exit(1);
});

// Mostrar ajuda quando nenhum comando é fornecido
if (process.argv.length === 2) {
  logger.plain(chalk.bold.blue('Mario Charts CLI'));
  logger.plain('Modern React component library for charts and dashboards\\n');
  program.help();
}

// Parse dos argumentos
program.parse(process.argv);