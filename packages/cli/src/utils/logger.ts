import chalk from 'chalk';

export class Logger {
  private silent: boolean;

  constructor(silent = false) {
    this.silent = silent;
  }

  private log(message: string, color?: 'red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'gray') {
    if (this.silent) return;
    
    const coloredMessage = color ? chalk[color](message) : message;
    console.log(coloredMessage);
  }

  info(message: string) {
    this.log(`${chalk.blue('ℹ')} ${message}`, 'blue');
  }

  success(message: string) {
    this.log(`${chalk.green('✓')} ${message}`, 'green');
  }

  warn(message: string) {
    this.log(`${chalk.yellow('⚠')} ${message}`, 'yellow');
  }

  error(message: string) {
    this.log(`${chalk.red('✗')} ${message}`, 'red');
  }

  debug(message: string) {
    if (process.env.DEBUG) {
      this.log(`${chalk.gray('🐛')} ${message}`, 'gray');
    }
  }

  plain(message: string) {
    if (!this.silent) {
      console.log(message);
    }
  }

  break() {
    if (!this.silent) {
      console.log();
    }
  }

  step(step: number, total: number, message: string) {
    this.info(`${chalk.cyan(`[${step}/${total}]`)} ${message}`);
  }
}