import { ICommand, ICommandSchema } from '../types/index';

/**
 * Command Registry
 * Central registry for all available commands
 * Implements Open/Closed Principle - open for extension, closed for modification
 */
export class CommandRegistry {
  private commands: Map<string, ICommand> = new Map();
  private aliases: Map<string, string> = new Map();

  /**
   * Register a command
   */
  register(command: ICommand): void {
    const schema = command.getSchema();
    this.commands.set(schema.name, command);
  }

  /**
   * Register command alias
   */
  registerAlias(alias: string, commandName: string): void {
    if (!this.commands.has(commandName)) {
      throw new Error(`Command not found: ${commandName}`);
    }
    this.aliases.set(alias, commandName);
  }

  /**
   * Get a command by name or alias
   */
  getCommand(nameOrAlias: string): ICommand | undefined {
    const realName = this.aliases.get(nameOrAlias) || nameOrAlias;
    return this.commands.get(realName);
  }

  /**
   * Check if command exists
   */
  hasCommand(nameOrAlias: string): boolean {
    const realName = this.aliases.get(nameOrAlias) || nameOrAlias;
    return this.commands.has(realName);
  }

  /**
   * Get all commands
   */
  getAllCommands(): ICommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get all command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys()).sort();
  }

  /**
   * Get all schemas
   */
  getAllSchemas(): ICommandSchema[] {
    return this.getAllCommands()
      .map((cmd) => cmd.getSchema())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get schema for a command
   */
  getSchema(commandName: string): ICommandSchema | undefined {
    const command = this.getCommand(commandName);
    return command?.getSchema();
  }

  /**
   * Get total command count
   */
  count(): number {
    return this.commands.size;
  }

  /**
   * Check if any commands are registered
   */
  isEmpty(): boolean {
    return this.commands.size === 0;
  }
}
