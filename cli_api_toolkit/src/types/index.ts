/**
 * Core Type Definitions
 * Following SOLID: Interface Segregation Principle
 */

/**
 * Command Parameter Definition
 * Describes what parameters a command accepts
 */
export interface IParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
  choices?: unknown[];
  example?: unknown;
}

/**
 * Command Schema
 * Metadata describing command capabilities for AI agents
 */
export interface ICommandSchema {
  name: string;
  description: string;
  longDescription?: string;
  parameters: IParameter[];
  examples: string[];
  category?: string;
}

/**
 * Result of command execution
 * Standardized output contract
 */
export interface ICommandResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  timestamp: string;
  executionTimeMs: number;
}

/**
 * Command Interface
 * Contract that all commands must implement
 */
export interface ICommand {
  getSchema(): ICommandSchema;
  execute(args: Record<string, unknown>): Promise<ICommandResult>;
  showHelp(): string;
}

/**
 * Service Provider Interface
 * For dependency injection
 */
export interface IServiceProvider {
  register<T>(key: string, factory: () => T): void;
  get<T>(key: string): T;
  has(key: string): boolean;
}

/**
 * Argument Parser Interface
 */
export interface IArgumentParser {
  parse(args: string[], schema: ICommandSchema): Record<string, unknown>;
}

/**
 * Command Executor Interface
 */
export interface ICommandExecutor {
  execute(command: ICommand, args: string[]): Promise<ICommandResult>;
}

/**
 * CLI Help System Interface
 */
export interface IHelpSystem {
  showCommandHelp(schema: ICommandSchema): string;
  showAllCommands(commands: ICommand[]): string;
  showAgentFormat(schema: ICommandSchema): string;
}
