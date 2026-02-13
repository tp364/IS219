import { CommandRegistry } from '../core/CommandRegistry';
import { FileService } from './FileService';

/**
 * Schema Export Service
 * 
 * Exports command schemas in machine-readable formats for AI agents.
 * Allows agents to introspect available tools and their capabilities.
 */
export class SchemaExportService {
  private registry: CommandRegistry;
  private fileService: FileService;

  constructor(registry: CommandRegistry, fileService?: FileService) {
    this.registry = registry;
    this.fileService = fileService || new FileService();
  }

  /**
   * Export all schemas as JSON
   */
  exportAllSchemasAsJSON(): string {
    const schemas = this.registry.getAllSchemas();
    return JSON.stringify(schemas, null, 2);
  }

  /**
   * Export single schema as JSON
   */
  exportSchemaAsJSON(commandName: string): string | null {
    const schema = this.registry.getSchema(commandName);
    return schema ? JSON.stringify(schema, null, 2) : null;
  }

  /**
   * Export schemas to file in references directory
   */
  async exportSchemasToFile(): Promise<string> {
    const content = this.exportAllSchemasAsJSON();
    return this.fileService.saveSearchResult('toolkit-schemas', content);
  }

  /**
   * Export OpenAPI-style documentation
   */
  exportAsOpenAPI(): string {
    const schemas = this.registry.getAllSchemas();

    const openapi = {
      openapi: '3.0.0',
      info: {
        title: 'CLI AI Toolkit',
        description: 'AI-powered command-line toolkit with extensible commands',
        version: '1.0.0',
      },
      paths: {} as Record<string, unknown>,
    };

    for (const schema of schemas) {
      const pathKey = `/commands/${schema.name}`;
      (openapi.paths as Record<string, unknown>)[pathKey] = {
        post: {
          summary: schema.description,
          description: schema.longDescription,
          parameters: schema.parameters.map((p) => ({
            name: p.name,
            in: 'query',
            required: p.required,
            schema: {
              type: p.type,
              default: p.default,
              enum: p.choices,
            },
          })),
          tags: [schema.category || 'general'],
        },
      };
    }

    return JSON.stringify(openapi, null, 2);
  }

  /**
   * Generate markdown documentation
   */
  generateMarkdownDocs(): string {
    const schemas = this.registry.getAllSchemas();
    let md = `# CLI Toolkit Commands\n\n`;
    md += `Generated: ${new Date().toISOString()}\n\n`;

    // Group by category
    const byCategory: Record<string, typeof schemas> = {};
    for (const schema of schemas) {
      const cat = schema.category || 'General';
      if (!byCategory[cat]) {
        byCategory[cat] = [];
      }
      byCategory[cat].push(schema);
    }

    // Generate docs by category
    for (const [category, cmds] of Object.entries(byCategory)) {
      md += `## ${category}\n\n`;

      for (const cmd of cmds) {
        md += `### \`${cmd.name}\`\n\n`;
        md += `${cmd.description}\n\n`;

        if (cmd.longDescription) {
          md += `${cmd.longDescription}\n\n`;
        }

        if (cmd.parameters.length > 0) {
          md += `#### Parameters\n\n`;
          for (const param of cmd.parameters) {
            const required = param.required ? '**required**' : 'optional';
            md += `- \`${param.name}\` (${param.type}) - ${required}\n`;
            md += `  ${param.description}\n`;
            if (param.default !== undefined) {
              md += `  Default: \`${JSON.stringify(param.default)}\`\n`;
            }
            if (param.choices) {
              md += `  Choices: ${param.choices.map((c) => `\`${c}\``).join(', ')}\n`;
            }
            md += '\n';
          }
        }

        if (cmd.examples.length > 0) {
          md += `#### Examples\n\n`;
          for (const example of cmd.examples) {
            md += `\`\`\`bash\nnpm run dev ${example}\n\`\`\`\n\n`;
          }
        }
      }
    }

    return md;
  }

  /**
   * Export for agent consumption (minimal, efficient format)
   */
  exportForAgent(): string {
    const schemas = this.registry.getAllSchemas();

    const agentFormat = {
      toolset: 'CLI AI Toolkit',
      version: '1.0.0',
      tools: schemas.map((schema) => ({
        name: schema.name,
        description: schema.description,
        category: schema.category,
        parameters: schema.parameters.map((p) => {
          const param: Record<string, unknown> = {
            name: p.name,
            type: p.type,
            required: p.required,
            description: p.description,
          };
          if (p.default !== undefined) param.default = p.default;
          if (p.choices) param.enum = p.choices;
          return param;
        }),
        examples: schema.examples,
      })),
    };

    return JSON.stringify(agentFormat, null, 2);
  }
}
