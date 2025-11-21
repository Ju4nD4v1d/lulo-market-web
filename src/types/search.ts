export type MatchType = 'exact_name' | 'partial_name' | 'description' | 'product_match';

export interface MatchedProduct {
  id: string;
  name: string;
  description?: string;
}

export interface SearchResultStore {
  id: string;
  name: string;
  description: string;
  matchType: MatchType;
  matchedProducts: MatchedProduct[];
  relevanceScore: number;
  distance?: number;
}

/**
 * Search results wrapper containing stores and metadata
 * Used by search API to return results with count information
 */
export interface SearchResults {
  stores: SearchResultStore[];
  totalCount: number;
  query: string;
}

export interface SearchOptions {
  enableLocation?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
}

export interface SearchMetadata {
  matchType: MatchType;
  relevanceScore: number;
  matchedProducts: MatchedProduct[];
  distance?: number;
}