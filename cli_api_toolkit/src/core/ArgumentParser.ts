import { ICommandSchema, IParameter, IArgumentParser } from '../types/index';

/**
 * Argument Validation Error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Argument Parser
 * Parses and validates command-line arguments against a schema
 * Implements Single Responsibility Principle
 */
export class ArgumentParser implements IArgumentParser {
  /**
   * Parse arguments based on command schema
   */
  parse(args: string[], schema: ICommandSchema): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    let positionalIndex = 0;

    // Get positional parameters (those without -- prefix)
    const positionalParams = schema.parameters.filter((p) => !p.name.startsWith('--'));
    const namedParams = schema.parameters.filter((p) => p.name.startsWith('--'));

    let i = 0;
    while (i < args.length) {
      const arg = args[i];

      // Check if it's a named parameter (--name or -n)
      if (arg.startsWith('--') || arg.startsWith('-')) {
        const param = this.findParameterByFlag(namedParams, arg);
        if (!param) {
          throw new ValidationError(`Unknown parameter: ${arg}`);
        }

        if (param.type === 'boolean') {
          result[param.name] = true;
        } else {
          i++;
          if (i >= args.length) {
            throw new ValidationError(`Parameter ${arg} requires a value`);
          }
          const value = this.coerceValue(args[i], param);
          result[param.name] = value;
        }
      } else {
        // Positional argument
        if (positionalIndex >= positionalParams.length) {
          throw new ValidationError(`Too many positional arguments`);
        }
        const param = positionalParams[positionalIndex];
        const value = this.coerceValue(arg, param);
        result[param.name] = value;
        positionalIndex++;
      }

      i++;
    }

    // Apply defaults and validate required parameters
    for (const param of schema.parameters) {
      if (!(param.name in result)) {
        if (param.required) {
          throw new ValidationError(
            `Missing required parameter: ${param.name} (${param.description})`
          );
        }
        if (param.default !== undefined) {
          result[param.name] = param.default;
        }
      }
    }

    return result;
  }

  /**
   * Find parameter by flag name (--name or -n)
   */
  private findParameterByFlag(params: IParameter[], flag: string): IParameter | undefined {
    const cleanFlag = flag.replace(/^-+/, '');
    return params.find((p) => {
      const paramName = p.name.replace(/^-+/, '');
      return paramName === cleanFlag || paramName.charAt(0) === cleanFlag;
    });
  }

  /**
   * Coerce string value to parameter type
   */
  private coerceValue(value: string, param: IParameter): unknown {
    switch (param.type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new ValidationError(`Parameter ${param.name} must be a number, got: ${value}`);
        }
        return num;

      case 'boolean':
        return value.toLowerCase() === 'true' || value === '1';

      case 'array':
        return value.split(',').map((v) => v.trim());

      case 'string':
      default:
        if (param.choices && !param.choices.includes(value)) {
          throw new ValidationError(
            `Parameter ${param.name} must be one of: ${param.choices.join(', ')}`
          );
        }
        return value;
    }
  }
}
