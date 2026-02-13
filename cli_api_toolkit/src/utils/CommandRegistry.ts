import { ICommand } from '../types/Command';

/**
 * CommandRegistry
 * 
 * Registry pattern for managing available CLI commands.
 * Follows SOLID: Dependency Inversion Principle & Open/Closed Principle
 * 
 * Makes it easy to add new commands without modifying existing code
 */

export class CommandRegistry {
  private commands: Map<string, ICommand> = new Map();

  /**
   * Register a new command
   */
  register(command: ICommand): void {
    this.commands.set(command.name, command);
  }

  /**
   * Get a command by name
   */
  getCommand(name: string): ICommand | undefined {
    return this.commands.get(name);
  }

  /**
   * Check if a command exists
   */
  hasCommand(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Get all available commands
   */
  getAllCommands(): ICommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get command names sorted alphabetically
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys()).sort();
  }

  /**
   * Display help for all registered commands
   */
  showAllHelp(): void {
    console.log('\n🤖 CLI AI Toolkit - Available Commands\n');
    const commands = this.getAllCommands();

    if (commands.length === 0) {
      console.log('No commands registered.');
      return;
    }

    commands.forEach((cmd) => {
      console.log(`  ${cmd.name.padEnd(20)} - ${cmd.description}`);
    });

    console.log('\nUse: npm run dev <command> [args]\n');
  }
}
