import { create } from 'zustand';
import { StoreData } from '../types/store';

interface SearchState {
  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filtered results
  filteredStores: StoreData[];
  setFilteredStores: (stores: StoreData[]) => void;

  // Search mode flags
  isUsingSearch: boolean;
  setIsUsingSearch: (isUsing: boolean) => void;

  isUsingFallbackSearch: boolean;
  setIsUsingFallbackSearch: (isUsing: boolean) => void;

  // Actions
  clearSearch: () => void;
  reset: () => void;
}

/**
 * Search Store
 * Centralized state management for search functionality
 *
 * Benefits:
 * - Single source of truth for search state
 * - Eliminates prop drilling
 * - Easy to test and debug
 * - Performance optimized (components only re-render when needed)
 */
export const useSearchStore = create<SearchState>((set) => ({
  // Initial state
  searchQuery: '',
  filteredStores: [],
  isUsingSearch: false,
  isUsingFallbackSearch: false,

  // Setters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilteredStores: (stores) => set({ filteredStores: stores }),
  setIsUsingSearch: (isUsing) => set({ isUsingSearch: isUsing }),
  setIsUsingFallbackSearch: (isUsing) => set({ isUsingFallbackSearch: isUsing }),

  // Actions
  clearSearch: () => set({
    searchQuery: '',
    filteredStores: [],
    isUsingSearch: false,
    isUsingFallbackSearch: false,
  }),

  reset: () => set({
    searchQuery: '',
    filteredStores: [],
    isUsingSearch: false,
    isUsingFallbackSearch: false,
  }),
}));
