/**
 * Web Search Service Types
 * Defines interfaces for advanced web search capabilities
 */

export interface ISearchResult {
  title: string;
  url: string;
  snippet: string;
  trustScore: number; // 0-1, higher is more trustworthy
  source: string;
  domain: string;
  publishedDate?: string;
  relevanceScore: number; // 0-1
}

export interface ISearchResponse {
  query: string;
  resultCount: number;
  results: ISearchResult[];
  executionTimeMs: number;
  relatedQueries: string[];
  summary?: string;
}

export type SearchMode = 'quick' | 'deep' | 'academic' | 'news' | 'recent';

export interface IWebSearchService {
  search(
    query: string,
    options?: {
      mode?: SearchMode;
      limit?: number;
      filter?: string;
      timeRange?: 'day' | 'week' | 'month' | 'year' | 'any';
    }
  ): Promise<ISearchResponse>;
  searchBatch(queries: string[]): Promise<ISearchResponse[]>;
  getCached(query: string): ISearchResponse | null;
  clearCache(): void;
}
