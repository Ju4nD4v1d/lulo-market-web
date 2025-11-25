import Fuse from 'fuse.js';
import type { StoreData } from '../types/store';
import type { Product } from '../types/product';
import type { SearchResultStore, MatchType } from '../types/search';

/**
 * Search Service using Fuse.js for fuzzy client-side search
 * Searches across store names, descriptions, and product data
 */

// Minimum query length for search
const MIN_QUERY_LENGTH = 2;

// Maximum number of results to return
const MAX_RESULTS = 50;

// Fuse.js configuration for optimal search performance
const FUSE_OPTIONS: Fuse.IFuseOptions<StoreData> = {
  // Search keys with weights (higher = more important)
  keys: [
    { name: 'name', weight: 2.0 },               // Store name (highest priority)
    { name: 'description', weight: 1.0 },        // Store description
    { name: 'cuisine', weight: 0.8 },            // Cuisine type
    { name: 'category', weight: 0.7 },           // Category
  ],
  // Threshold: 0.0 = perfect match, 1.0 = match anything
  threshold: 0.4,
  // Include score and matches in results
  includeScore: true,
  includeMatches: true,
  // Use extended search for better control
  useExtendedSearch: false,
  // Minimum match character length
  minMatchCharLength: 2,
  // Ignore location (search entire string)
  ignoreLocation: true,
};

// Fuse.js configuration for product search
const PRODUCT_FUSE_OPTIONS: Fuse.IFuseOptions<Product> = {
  keys: [
    { name: 'name', weight: 2.0 },
    { name: 'description', weight: 1.0 },
    { name: 'category', weight: 0.8 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

/**
 * Determines the match type based on which field matched
 */
function determineMatchType(matches: readonly Fuse.FuseResultMatch[] | undefined): MatchType {
  if (!matches || matches.length === 0) {
    return 'partial_name';
  }

  const matchedKeys = matches.map(m => m.key);

  if (matchedKeys.includes('name')) {
    // Check if it's an exact match or partial
    const nameMatch = matches.find(m => m.key === 'name');
    if (nameMatch && nameMatch.value) {
      return 'exact_name';
    }
    return 'partial_name';
  }

  if (matchedKeys.includes('description')) {
    return 'description';
  }

  return 'partial_name';
}

/**
 * Calculates relevance score (0-100) from Fuse.js score
 * Fuse score: 0 = perfect match, 1 = worst match
 * We invert it to: 100 = perfect match, 0 = worst match
 */
function calculateRelevanceScore(fuseScore: number | undefined): number {
  if (fuseScore === undefined) return 0;
  return Math.round((1 - fuseScore) * 100);
}

/**
 * Searches stores by name and description
 */
export function searchStores(
  stores: StoreData[],
  query: string
): SearchResultStore[] {
  // Validate query
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  // Filter out inactive stores
  const activeStores = stores.filter(store =>
    store.status === undefined || store.status === 'active'
  );

  // Initialize Fuse with stores
  const fuse = new Fuse(activeStores, FUSE_OPTIONS);

  // Perform search
  const results = fuse.search(trimmedQuery);

  // Transform results to SearchResultStore format
  return results
    .slice(0, MAX_RESULTS)
    .map(result => ({
      id: result.item.id,
      name: result.item.name,
      description: result.item.description || '',
      category: result.item.category,
      cuisine: result.item.cuisine,
      location: result.item.location,
      matchType: determineMatchType(result.matches),
      matchedProducts: [],
      relevanceScore: calculateRelevanceScore(result.score),
    }));
}

/**
 * Searches products and returns stores that have matching products
 */
export function searchProductsInStores(
  stores: StoreData[],
  products: Product[],
  query: string
): SearchResultStore[] {
  // Validate query
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  // Filter active products only
  const activeProducts = products.filter(p => p.status === 'active');

  // Initialize Fuse with products
  const fuse = new Fuse(activeProducts, PRODUCT_FUSE_OPTIONS);

  // Perform search
  const productResults = fuse.search(trimmedQuery);

  // Group products by storeId
  const storeIdToProducts = new Map<string, Array<{ product: Product; score: number }>>();

  productResults.forEach(result => {
    const storeId = result.item.storeId;
    if (!storeIdToProducts.has(storeId)) {
      storeIdToProducts.set(storeId, []);
    }
    storeIdToProducts.get(storeId)!.push({
      product: result.item,
      score: result.score || 0,
    });
  });

  // Build search results for stores with matching products
  const results: SearchResultStore[] = [];

  storeIdToProducts.forEach((matchedProducts, storeId) => {
    const store = stores.find(s => s.id === storeId);
    if (!store || (store.status && store.status !== 'active')) {
      return;
    }

    // Sort products by score (best matches first) and take top 3
    const topProducts = matchedProducts
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(mp => ({
        id: mp.product.id,
        name: mp.product.name,
        description: mp.product.description,
        price: mp.product.price,
        category: mp.product.category,
      }));

    // Use the best product score as the store's relevance score
    const bestScore = Math.min(...matchedProducts.map(mp => mp.score));

    results.push({
      id: store.id,
      name: store.name,
      description: store.description || '',
      category: store.category,
      cuisine: store.cuisine,
      location: store.location,
      matchType: 'product_match',
      matchedProducts: topProducts,
      relevanceScore: calculateRelevanceScore(bestScore),
    });
  });

  return results.slice(0, MAX_RESULTS);
}

/**
 * Comprehensive search that combines store and product searches
 * Returns unique stores sorted by relevance
 */
export function searchStoresAndProducts(
  stores: StoreData[],
  products: Product[],
  query: string
): SearchResultStore[] {
  // Validate query
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  // Search stores
  const storeResults = searchStores(stores, trimmedQuery);

  // Search products
  const productResults = searchProductsInStores(stores, products, trimmedQuery);

  // Combine results, avoiding duplicates
  const storeIds = new Set<string>();
  const combinedResults: SearchResultStore[] = [];

  // Add store matches first (higher priority)
  storeResults.forEach(result => {
    if (!storeIds.has(result.id)) {
      storeIds.add(result.id);
      combinedResults.push(result);
    }
  });

  // Add product matches (only if store not already included)
  productResults.forEach(result => {
    if (!storeIds.has(result.id)) {
      storeIds.add(result.id);
      combinedResults.push(result);
    }
  });

  // Sort by relevance score (descending)
  combinedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return combinedResults;
}

/**
 * Sanitizes search query to prevent issues
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 100);     // Limit length
}
