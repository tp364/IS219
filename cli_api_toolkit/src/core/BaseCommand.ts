import { ICommand, ICommandSchema, ICommandResult, IParameter } from '../types/index';

/**
 * Abstract Base Command
 * Provides template for all command implementations
 * Implements Template Method pattern and SOLID principles
 */
export abstract class BaseCommand implements ICommand {
  /**
   * Command schema - must be implemented by subclasses
   */
  abstract getSchema(): ICommandSchema;

  /**
   * Command execution logic - must be implemented by subclasses
   */
  abstract execute(args: Record<string, unknown>): Promise<ICommandResult>;

  /**
   * Generate help text for this command
   */
  showHelp(): string {
    const schema = this.getSchema();
    const lines: string[] = [];

    lines.push(`\n📋 ${schema.name}`);
    lines.push('═'.repeat(50));
    lines.push(`\nDescription: ${schema.description}`);

    if (schema.longDescription) {
      lines.push(`\nDetails:\n${schema.longDescription}`);
    }

    if (schema.parameters.length > 0) {
      lines.push('\n\n📝 Parameters:');
      for (const param of schema.parameters) {
        const indicator = param.required ? '(required)' : '(optional)';
        lines.push(`\n  ${param.name} ${indicator}`);
        lines.push(`    Type: ${param.type}`);
        lines.push(`    ${param.description}`);
        if (param.default !== undefined) {
          lines.push(`    Default: ${JSON.stringify(param.default)}`);
        }
        if (param.choices && param.choices.length > 0) {
          lines.push(`    Options: ${param.choices.join(', ')}`);
        }
      }
    }

    if (schema.examples.length > 0) {
      lines.push('\n\n💡 Examples:');
      for (const example of schema.examples) {
        lines.push(`  npm run dev ${example}`);
      }
    }

    lines.push('\n');
    return lines.join('\n');
  }

  /**
   * Create a successful result
   */
  protected success<T = unknown>(data?: T, customStatus?: number): ICommandResult<T> {
    return {
      success: true,
      data,
      status: customStatus || 200,
      timestamp: new Date().toISOString(),
      executionTimeMs: 0,
    };
  }

  /**
   * Create a failure result
   */
  protected failure(error: string, customStatus?: number): ICommandResult {
    return {
      success: false,
      error,
      status: customStatus || 500,
      timestamp: new Date().toISOString(),
      executionTimeMs: 0,
    };
  }

  /**
   * Validate required parameters are present
   */
  protected validateRequired(args: Record<string, unknown>, requiredParams: string[]): string | null {
    for (const param of requiredParams) {
      if (args[param] === undefined || args[param] === null || args[param] === '') {
        return `Missing required parameter: ${param}`;
      }
    }
    return null;
  }

  /**
   * Validate parameter is one of allowed choices
   */
  protected validateChoice(
    paramName: string,
    value: unknown,
    choices: unknown[]
  ): string | null {
    if (!choices.includes(value)) {
      return `Parameter ${paramName} must be one of: ${choices.join(', ')}, got: ${value}`;
    }
    return null;
  }

  /**
   * Helper to create parameter definitions
   */
  protected createParameter(config: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    description: string;
    required?: boolean;
    default?: unknown;
    choices?: unknown[];
    example?: unknown;
  }): IParameter {
    return {
      name: config.name,
      type: config.type,
      description: config.description,
      required: config.required ?? true,
      default: config.default,
      choices: config.choices,
      example: config.example,
    };
  }
}
