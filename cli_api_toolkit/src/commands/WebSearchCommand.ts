import { BaseCommand } from '../core/BaseCommand';
import { ICommandSchema, ICommandResult } from '../types/index';
import { WebSearchService } from '../services/WebSearchService';
import { FileService } from '../services/FileService';
import { SearchMode, ISearchResponse } from '../services/types/WebSearchTypes';

/**
 * WebSearchCommand
 * 
 * Advanced web search for AI agents with multiple search modes, caching, and structured results.
 * Follows SOLID: Single Responsibility & Dependency Inversion Principles
 */

export class WebSearchCommand extends BaseCommand {
  private webSearchService?: WebSearchService;
  private fileService?: FileService;

  constructor(webSearchService?: WebSearchService, fileService?: FileService) {
    super();
    // Defer creating services until execute to avoid requiring API keys at CLI startup
    this.webSearchService = webSearchService;
    this.fileService = fileService;
  }

  /**
   * Get command schema for AI agent introspection
   * Schema auto-updates documentation automatically
   */
  getSchema(): ICommandSchema {
    return {
      name: 'web-search',
      description: 'Advanced web search for AI agents with multiple modes and structured results',
      longDescription:
        'Performs intelligent web searches with multiple modes (quick, deep, academic, news, recent). ' +
        'Results include trust scores, relevance metrics, and source credibility. ' +
        'Supports caching, batch searches, and structured output for AI consumption. ' +
        'Perfect for finding information outside knowledge cutoffs.',
      category: 'Research',
      parameters: [
        this.createParameter({
          name: 'query',
          type: 'string',
          description: 'The search query to execute',
          required: true,
          example: 'latest developments in AI safety 2026',
        }),
        this.createParameter({
          name: '--mode',
          type: 'string',
          description: 'Search mode: quick (5-10 results), deep (15-20 academic sources), academic (peer-reviewed), news (latest), recent (last 7 days)',
          required: false,
          default: 'quick',
          choices: ['quick', 'deep', 'academic', 'news', 'recent'],
          example: 'deep',
        }),
        this.createParameter({
          name: '--limit',
          type: 'number',
          description: 'Maximum number of results to return (1-50)',
          required: false,
          default: 10,
          example: 15,
        }),
        this.createParameter({
          name: '--time',
          type: 'string',
          description: 'Time range filter: day, week, month, year, or any',
          required: false,
          default: 'any',
          choices: ['day', 'week', 'month', 'year', 'any'],
          example: 'week',
        }),
        this.createParameter({
          name: '--domain',
          type: 'string',
          description: 'Filter results to specific domain (e.g., github.com, arxiv.org)',
          required: false,
          example: 'github.com',
        }),
        this.createParameter({
          name: '--format',
          type: 'string',
          description: 'Output format: text (human-readable), json (structured), or markdown (reference-friendly)',
          required: false,
          default: 'text',
          choices: ['text', 'json', 'markdown'],
        }),
        this.createParameter({
          name: '--save',
          type: 'boolean',
          description: 'Save results to references folder',
          required: false,
          default: true,
        }),
      ],
      examples: [
        'web-search "AI safety alignment challenges"',
        'web-search "Rust async programming" --mode deep --limit 20',
        'web-search "climate change latest research" --mode academic --time month',
        'web-search "TypeScript updates" --domain github.com --format json',
        'web-search "breaking news AI" --mode news --time day',
      ],
    };
  }

  /**
   * Execute advanced web search
   */
  async execute(args: Record<string, unknown>): Promise<ICommandResult> {
    try {
      const query = args.query as string;
      const mode = (args['--mode'] || 'quick') as SearchMode;
      const limit = (args['--limit'] as number) || 10;
      const timeRange = (args['--time'] || 'any') as 'day' | 'week' | 'month' | 'year' | 'any';
      const domain = args['--domain'] as string | undefined;
      const format = (args['--format'] || 'text') as 'text' | 'json' | 'markdown';
      const shouldSave = args['--save'] !== false;

      // Validate parameters
      if (!query || query.trim().length === 0) {
        return this.failure('Search query cannot be empty');
      }

      if (limit < 1 || limit > 50) {
        return this.failure('Limit must be between 1 and 50');
      }

      console.log(`\n🔍 Web Search - ${mode.toUpperCase()} Mode`);
      console.log('═'.repeat(60));
      console.log(`Query: "${query}"`);
      console.log(`Results: ${limit} | Time Range: ${timeRange} | Format: ${format}`);
      if (domain) console.log(`Domain Filter: ${domain}`);
      console.log('');

      // Lazy-init services (create if not provided)
      if (!this.webSearchService) this.webSearchService = new WebSearchService();
      if (!this.fileService) this.fileService = new FileService();

      // Perform search
      const results = await this.webSearchService.search(query, {
        mode,
        limit,
        timeRange,
        filter: domain,
      });

      // Format and display results
      this.displayResults(results, format);

      // Save results if requested
      if (shouldSave) {
        const content = this.formatForFile(results, format);
        const filepath = this.fileService.saveSearchResult(query, content);
        console.log(`\n✓ Results saved to: ${filepath}`);
      }

      return this.success({
        query,
        mode,
        resultCount: results.resultCount,
        executionTimeMs: results.executionTimeMs,
        sources: results.results.map((r) => ({
          title: r.title,
          url: r.url,
          domain: r.domain,
          trustScore: r.trustScore,
        })),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.failure(`Search failed: ${message}`);
    }
  }

  /**
   * Display results in specified format
   */
  private displayResults(results: ISearchResponse, format: 'text' | 'json' | 'markdown'): void {
    console.log(`Found ${results.resultCount} results\n`);

    if (format === 'json') {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    if (format === 'markdown') {
      console.log('# Search Results\n');
      console.log(`**Query:** ${results.query}\n`);
      if (results.summary) {
        console.log(`**Summary:** ${results.summary}\n`);
      }

      results.results.forEach((result, idx) => {
        console.log(`## ${idx + 1}. ${result.title}`);
        console.log(`**URL:** [${result.domain}](${result.url})`);
        console.log(`**Trust:** ${(result.trustScore * 100).toFixed(0)}% | **Relevance:** ${(result.relevanceScore * 100).toFixed(0)}%`);
        console.log(`\n${result.snippet}\n`);
      });

      if (results.relatedQueries.length > 0) {
        console.log('### Related Searches\n');
        results.relatedQueries.forEach((q) => console.log(`- ${q}`));
      }
      return;
    }

    // Text format (human-readable)
    if (results.summary) {
      console.log(`📊 Summary: ${results.summary}\n`);
    }

    results.results.forEach((result, idx) => {
      const trustBar = this.createBar(result.trustScore);
      const relevanceBar = this.createBar(result.relevanceScore);

      console.log(`\n${idx + 1}. ${result.title}`);
      console.log(`   🔗 ${result.url}`);
      console.log(`   📄 ${result.snippet}`);
      console.log(`   💾 Source: ${result.domain}`);
      console.log(`   ⭐ Trust: ${trustBar} (${(result.trustScore * 100).toFixed(0)}%)`);
      console.log(`   📈 Relevance: ${relevanceBar} (${(result.relevanceScore * 100).toFixed(0)}%)`);
      if (result.publishedDate) {
        console.log(`   📅 Published: ${result.publishedDate}`);
      }
    });

    if (results.relatedQueries.length > 0) {
      console.log(`\n\n💡 Related Searches:`);
      results.relatedQueries.forEach((q) => console.log(`   • ${q}`));
    }

    console.log(`\n⏱️  Search completed in ${results.executionTimeMs}ms`);
  }

  /**
   * Format results for file storage
   */
  private formatForFile(results: ISearchResponse, format: 'text' | 'json' | 'markdown'): string {
    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    }

    if (format === 'markdown') {
      let md = `# Web Search Results\n\n`;
      md += `**Query:** ${results.query}\n`;
      md += `**Execution Time:** ${results.executionTimeMs}ms\n`;
      md += `**Result Count:** ${results.resultCount}\n\n`;

      if (results.summary) {
        md += `## Summary\n\n${results.summary}\n\n`;
      }

      md += `## Results\n\n`;
      results.results.forEach((r, idx) => {
        md += `### ${idx + 1}. ${r.title}\n\n`;
        md += `- **URL:** [${r.domain}](${r.url})\n`;
        md += `- **Trust Score:** ${(r.trustScore * 100).toFixed(0)}%\n`;
        md += `- **Relevance:** ${(r.relevanceScore * 100).toFixed(0)}%\n`;
        if (r.publishedDate) {
          md += `- **Published:** ${r.publishedDate}\n`;
        }
        md += `\n${r.snippet}\n\n`;
      });

      if (results.relatedQueries.length > 0) {
        md += `## Related Queries\n\n`;
        results.relatedQueries.forEach((q) => {
          md += `- ${q}\n`;
        });
      }

      return md;
    }

    // Plain text format
    return JSON.stringify(results, null, 2);
  }

  /**
   * Create visual progress bar
   */
  private createBar(value: number, length: number = 10): string {
    const filled = Math.round(value * length);
    return '█'.repeat(filled) + '░'.repeat(length - filled);
  }
}

export default WebSearchCommand;
