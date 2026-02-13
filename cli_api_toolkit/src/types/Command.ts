/**
 * ICommand Interface
 * 
 * This interface defines the contract for all CLI commands.
 * Follows SOLID principles: Interface Segregation Principle
 */

export interface ICommand {
  name: string;
  description: string;
  execute(args: string[]): Promise<void>;
  showHelp(): void;
}
