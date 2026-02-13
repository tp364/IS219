import { ICommand, ICommandResult, ICommandExecutor, IArgumentParser } from '../types/index';
import { ArgumentParser, ValidationError } from './ArgumentParser';

/**
 * Command Executor
 * Handles command execution with standardized error handling and timing
 * Implements Single Responsibility and Dependency Inversion Principles
 */
export class CommandExecutor implements ICommandExecutor {
  private argumentParser: IArgumentParser;

  constructor(argumentParser?: IArgumentParser) {
    this.argumentParser = argumentParser || new ArgumentParser();
  }

  /**
   * Execute a command with arguments
   * Returns standardized result format
   */
  async execute(command: ICommand, args: string[]): Promise<ICommandResult> {
    const startTime = Date.now();

    try {
      // Parse and validate arguments
      const schema = command.getSchema();
      const parsedArgs = this.argumentParser.parse(args, schema);

      // Execute command
      const result = await command.execute(parsedArgs);

      // Add execution timing
      result.executionTimeMs = Date.now() - startTime;
      result.timestamp = new Date().toISOString();

      return result;
    } catch (error) {
      const message =
        error instanceof ValidationError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unknown error occurred';

      return {
        success: false,
        error: message,
        status: error instanceof ValidationError ? 400 : 500,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}
