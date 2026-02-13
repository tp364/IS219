import { ICommandSchema, IHelpSystem } from '../types/index';

/**
 * Help System
 * Generates human-readable and machine-readable help documentation
 * Implements Single Responsibility Principle
 */
export class HelpSystem implements IHelpSystem {
  /**
   * Generate help for a single command (human format)
   */
  showCommandHelp(schema: ICommandSchema): string {
    const lines: string[] = [];

    lines.push(`\n📋 ${schema.name}`);
    lines.push('═'.repeat(50));
    lines.push(`\nDescription: ${schema.description}`);

    if (schema.longDescription) {
      lines.push(`\n${schema.longDescription}`);
    }

    if (schema.parameters.length > 0) {
      lines.push('\n\n📝 Parameters:');
      for (const param of schema.parameters) {
        const indicator = param.required ? '(required)' : '(optional)';
        lines.push(`  \n  ${param.name} ${indicator}`);
        lines.push(`    Type: ${param.type}`);
        lines.push(`    ${param.description}`);
        if (param.default !== undefined) {
          lines.push(`    Default: ${JSON.stringify(param.default)}`);
        }
        if (param.choices) {
          lines.push(`    Choices: ${param.choices.join(', ')}`);
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
   * Generate help for all commands (human format)
   */
  showAllCommands(commands: unknown[]): string {
    const lines: string[] = [];
    lines.push('\n🤖 CLI Toolkit - Available Commands');
    lines.push('═'.repeat(60));

    if (Array.isArray(commands) && commands.length === 0) {
      lines.push('\nNo commands registered.');
      return lines.join('\n');
    }

    // Get schema from each command (they should have getSchema method)
    const schemas = (commands as unknown[])
      .map((cmd: unknown) => {
        if (cmd && typeof cmd === 'object' && 'getSchema' in cmd) {
          try {
            return (cmd.getSchema as () => ICommandSchema)();
          } catch {
            return null;
          }
        }
        return null;
      })
      .filter((s): s is ICommandSchema => s !== null);

    // Group by category if available
    const byCategory: Record<string, ICommandSchema[]> = {};
    for (const schema of schemas) {
      const cat = schema.category || 'General';
      if (!byCategory[cat]) {
        byCategory[cat] = [];
      }
      byCategory[cat].push(schema);
    }

    // Display by category
    for (const [category, cmds] of Object.entries(byCategory)) {
      lines.push(`\n${category}:`);
      for (const cmd of cmds) {
        lines.push(`  ${cmd.name.padEnd(20)} - ${cmd.description}`);
      }
    }

    lines.push('\n\nUsage: npm run dev <command> [arguments]');
    lines.push('Help:  npm run dev <command> --help\n');

    return lines.join('\n');
  }

  /**
   * Generate help in machine-readable format for AI agents
   * JSON schema format
   */
  showAgentFormat(schema: ICommandSchema): string {
    const agentSchema = {
      name: schema.name,
      description: schema.description,
      longDescription: schema.longDescription,
      category: schema.category,
      parameters: schema.parameters.map((p) => ({
        name: p.name,
        type: p.type,
        description: p.description,
        required: p.required,
        default: p.default,
        choices: p.choices,
        example: p.example,
      })),
      examples: schema.examples,
      usage: `npm run dev ${schema.name} [parameters]`,
    };

    return JSON.stringify(agentSchema, null, 2);
  }
}
