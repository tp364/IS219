import { OpenAIService } from './OpenAIService';
import { IWebSearchService, ISearchResponse, ISearchResult, SearchMode } from './types/WebSearchTypes';

/**
 * Enhanced Web Search Service
 * 
 * Provides advanced web search capabilities with:
 * - Multiple search modes (quick, deep, academic, news, recent)
 * - Result caching for efficiency
 * - Trust scoring for source credibility
 * - Structured output for AI agent consumption
 * - Batch search capabilities
 */
export class WebSearchService implements IWebSearchService {
  private openaiService: OpenAIService;
  private cache: Map<string, ISearchResponse> = new Map();
  private maxCacheSize: number = 100;

  constructor(openaiService?: OpenAIService) {
    this.openaiService = openaiService || new OpenAIService();
  }

  /**
   * Perform web search with specified mode and options
   */
  async search(
    query: string,
    options?: {
      mode?: SearchMode;
      limit?: number;
      filter?: string;
      timeRange?: 'day' | 'week' | 'month' | 'year' | 'any';
    }
  ): Promise<ISearchResponse> {
    const cacheKey = this.generateCacheKey(query, options);

    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const mode = options?.mode || 'quick';
    const limit = options?.limit || 10;

    const startTime = Date.now();

    // Build enhanced prompt based on search mode
    const prompt = this.buildSearchPrompt(query, mode, options);
    const rawResult = await this.openaiService.webSearch(prompt);

    // Parse and structure results
    const results = this.parseResults(rawResult, limit);
    const relatedQueries = this.extractRelatedQueries(rawResult);
    const summary = this.generateSummary(results, mode);

    const response: ISearchResponse = {
      query,
      resultCount: results.length,
      results,
      executionTimeMs: Date.now() - startTime,
      relatedQueries,
      summary,
    };

    // Cache the response
    this.cacheResponse(cacheKey, response);

    return response;
  }

  /**
   * Perform batch search on multiple queries
   */
  async searchBatch(queries: string[]): Promise<ISearchResponse[]> {
    const results = await Promise.all(
      queries.map((q) => this.search(q, { mode: 'quick' }))
    );
    return results;
  }

  /**
   * Get cached response
   */
  getCached(query: string): ISearchResponse | null {
    return this.cache.get(query) || null;
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Build enhanced prompt based on search mode
   */
  private buildSearchPrompt(
    query: string,
    mode: SearchMode,
    options?: {
      filter?: string;
      timeRange?: string;
    }
  ): string {
    const timeFilter = options?.timeRange ? `published in the last ${options.timeRange}` : '';
    const domainFilter = options?.filter ? `from ${options.filter}` : '';

    const modeInstructions: Record<SearchMode, string> = {
      quick: 'Provide the top 5-10 most relevant and recent results with brief summaries.',
      deep: 'Provide comprehensive research with 15-20 detailed results, including academic sources, news, and technical articles.',
      academic: 'Focus on academic papers, research articles, and peer-reviewed sources. Provide citations and institutional affiliations.',
      news: 'Find the latest news articles and breaking information. Include publication date and source credibility.',
      recent: 'Show only very recent information from the last few days. Include timestamps and source freshness indicators.',
    };

    return `
Search Query: "${query}"
${timeFilter ? `Time Range: ${timeFilter}` : ''}
${domainFilter ? `Domain Filter: ${domainFilter}` : ''}

Search Mode: ${mode}
${modeInstructions[mode]}

For each result, provide:
- Title
- URL
- Brief snippet (1-2 sentences)
- Source domain
- Trust score (0-1)
- Relevance score (0-1)
- Publish date (if available)

Format results as structured data for programmatic parsing.
    `.trim();
  }

  /**
   * Parse raw search results into structured format
   */
  private parseResults(rawResult: string, limit: number): ISearchResult[] {
    const results: ISearchResult[] = [];

    // Extract results from the response text
    // This is a simple regex-based parser - in production, use more robust parsing
    const resultPattern = /(?:title|Title):\s*["']?([^"'\n]+)["']?[\s\n]*(?:url|URL):\s*(\S+)[\s\n]*(?:snippet|Snippet):\s*([^\n]+)/gi;

    let match;
    while ((match = resultPattern.exec(rawResult)) !== null && results.length < limit) {
      const [, title, url, snippet] = match;

      // Extract domain from URL
      const domain = this.extractDomain(url);

      // Calculate trust score based on domain
      const trustScore = this.calculateTrustScore(domain);

      // Calculate relevance score (simple heuristic)
      const relevanceScore = this.calculateRelevance(title + ' ' + snippet, title);

      results.push({
        title: title?.trim() || 'Untitled',
        url: url?.trim() || '',
        snippet: snippet?.trim() || '',
        trustScore,
        relevanceScore,
        source: domain,
        domain,
        publishedDate: this.extractDate(rawResult),
      });
    }

    // If parsing didn't work well, create a fallback result
    if (results.length === 0) {
      results.push({
        title: 'Search Results',
        url: '#',
        snippet: rawResult.substring(0, 200),
        trustScore: 0.7,
        relevanceScore: 0.8,
        source: 'OpenAI Web Search',
        domain: 'openai.com',
      });
    }

    return results.slice(0, limit);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname || url;
    } catch {
      return url.split('/')[0] || 'unknown';
    }
  }

  /**
   * Calculate trust score for a domain
   */
  private calculateTrustScore(domain: string): number {
    const trustyDomains: Record<string, number> = {
      'github.com': 0.95,
      'stackoverflow.com': 0.92,
      'wikipedia.org': 0.90,
      'mozilla.org': 0.93,
      'nodejs.org': 0.94,
      'python.org': 0.93,
      'tensorflow.org': 0.92,
      'openai.com': 0.95,
      'google.com': 0.92,
      'microsoft.com': 0.91,
      'medium.com': 0.70,
      'dev.to': 0.75,
    };

    // Check if domain is in trusted list
    for (const [trustedDomain, score] of Object.entries(trustyDomains)) {
      if (domain.includes(trustedDomain)) {
        return score;
      }
    }

    // Default score for unknown domains
    return 0.65;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(text: string, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();

    const matchCount = queryTerms.filter((term) => textLower.includes(term)).length;
    const relevance = Math.min(1.0, matchCount / queryTerms.length);

    return relevance;
  }

  /**
   * Extract date from result
   */
  private extractDate(text: string): string | undefined {
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/;
    const match = text.match(datePattern);
    return match ? match[0] : undefined;
  }

  /**
   * Extract related search queries from results
   */
  private extractRelatedQueries(text: string): string[] {
    const queries: string[] = [];

    // Look for "related", "similar", "also search" patterns
    const patterns = [
      /(?:related|similar|also search for):\s*["']?([^"'\n]+)["']?/gi,
      /people also (?:ask|search for):\s*["']?([^"'\n]+)["']?/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null && queries.length < 5) {
        const query = match[1]?.trim();
        if (query && !queries.includes(query)) {
          queries.push(query);
        }
      }
    }

    return queries;
  }

  /**
   * Generate summary based on search mode
   */
  private generateSummary(results: ISearchResult[], mode: SearchMode): string {
    if (results.length === 0) {
      return 'No results found for this query.';
    }

    const topResult = results[0];
    const avgTrust = (
      results.reduce((sum, r) => sum + r.trustScore, 0) / results.length
    ).toFixed(2);

    const summaries: Record<SearchMode, string> = {
      quick: `Found ${results.length} relevant results. Top result: "${topResult.title}"`,
      deep: `Comprehensive research found ${results.length} sources. Average source trust: ${avgTrust}`,
      academic: `Found ${results.length} academic sources. Leading publication: "${topResult.title}"`,
      news: `Latest news: "${topResult.title}" (${topResult.publishedDate || 'recent'})`,
      recent: `Most recent update: "${topResult.title}" from ${topResult.domain}`,
    };

    return summaries[mode];
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(
    query: string,
    options?: {
      mode?: SearchMode;
      filter?: string;
      timeRange?: string;
    }
  ): string {
    const mode = options?.mode || 'quick';
    const filter = options?.filter || '';
    const time = options?.timeRange || '';
    return `${query}|${mode}|${filter}|${time}`;
  }

  /**
   * Cache a response, maintaining size limit
   */
  private cacheResponse(key: string, response: ISearchResponse): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, response);
  }
}
