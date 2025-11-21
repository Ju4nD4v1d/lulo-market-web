import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { StoreData } from '../../../types/store';

interface UseVirtualStoreListOptions {
  stores: StoreData[];
  estimatedItemHeight?: number;
  overscan?: number;
}

interface UseVirtualStoreListReturn {
  parentRef: React.RefObject<HTMLDivElement>;
  virtualItems: Array<{
    index: number;
    size: number;
    start: number;
    end: number;
    key: string | number;
  }>;
  totalSize: number;
  measureElement: (node: HTMLElement | null) => void;
  getVirtualStore: (index: number) => StoreData | undefined;
}

/**
 * useVirtualStoreList Hook
 *
 * Implements virtual scrolling for large store lists using @tanstack/react-virtual
 *
 * Benefits:
 * - Only renders visible stores (improves performance with 500+ stores)
 * - Smooth scrolling with dynamic height support
 * - Automatic measurement of item heights
 * - Configurable overscan for smoother scrolling
 *
 * @param stores - Array of stores to virtualize
 * @param estimatedItemHeight - Estimated height of each store card (default: 400px)
 * @param overscan - Number of items to render outside viewport (default: 5)
 *
 * @returns Virtual scrolling state and helpers
 */
export const useVirtualStoreList = ({
  stores,
  estimatedItemHeight = 400,
  overscan = 5,
}: UseVirtualStoreListOptions): UseVirtualStoreListReturn => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Create virtualizer instance
  const virtualizer = useVirtualizer({
    count: stores.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan,
    // Enable dynamic height measurement for responsive cards
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Helper to get store by virtual item index
  const getVirtualStore = useMemo(() => {
    return (index: number) => stores[index];
  }, [stores]);

  return {
    parentRef,
    virtualItems,
    totalSize,
    measureElement: virtualizer.measureElement,
    getVirtualStore,
  };
};
