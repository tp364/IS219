import { ICommand } from '../types/Command';

/**
 * BaseCommand
 * 
 * Abstract base class for all commands.
 * Provides common functionality and ensures consistent command structure.
 * Follows SOLID: Template Method pattern
 */

export abstract class BaseCommand implements ICommand {
  abstract name: string;
  abstract description: string;

  /**
   * Execute the command with provided arguments
   */
  abstract execute(args: string[]): Promise<void>;

  /**
   * Display help information for the command
   */
  showHelp(): void {
    console.log(`
Usage: ${this.name}
Description: ${this.description}

Options:
  --help    Show this help message
    `);
  }

  /**
   * Protected utility to validate arguments
   */
  protected validateArgs(args: string[], minCount: number): boolean {
    return args.length >= minCount;
  }

  /**
   * Protected utility to log formatted output
   */
  protected log(message: string, level: 'info' | 'success' | 'error' = 'info'): void {
    const prefix = {
      info: '[INFO]',
      success: '[✓]',
      error: '[✗]',
    };

    console.log(`${prefix[level]} ${message}`);
  }
}
