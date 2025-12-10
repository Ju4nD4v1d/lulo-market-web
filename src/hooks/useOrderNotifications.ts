/**
 * Hook for real-time order notifications
 * Provides unread count, browser notifications, and mark-as-seen functionality
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { subscribeToStoreOrders } from '../services/api/orderApi';
import { Order } from '../types/order';
import { useLanguage } from '../context/LanguageContext';

const LAST_SEEN_KEY = 'lulocart_orders_last_seen';
const NOTIFICATION_PERMISSION_KEY = 'lulocart_notification_permission_asked';

interface UseOrderNotificationsOptions {
  storeId: string | null;
  enabled?: boolean;
  onNavigate?: (path: string) => void;
}

interface UseOrderNotificationsResult {
  orders: Order[];
  unreadCount: number;
  markAllAsSeen: () => void;
  notificationPermission: NotificationPermission | 'default';
  requestNotificationPermission: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Get last seen timestamp from localStorage
 */
const getLastSeenTimestamp = (storeId: string): number => {
  try {
    const stored = localStorage.getItem(`${LAST_SEEN_KEY}_${storeId}`);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

/**
 * Save last seen timestamp to localStorage
 */
const setLastSeenTimestamp = (storeId: string, timestamp: number): void => {
  try {
    localStorage.setItem(`${LAST_SEEN_KEY}_${storeId}`, timestamp.toString());
  } catch {
    // localStorage not available
  }
};

/**
 * Check if notification permission was already asked
 */
const wasPermissionAsked = (): boolean => {
  try {
    return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Mark that permission was asked
 */
const markPermissionAsked = (): void => {
  try {
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
  } catch {
    // localStorage not available
  }
};

/**
 * Show browser notification for new order
 */
const showBrowserNotification = (
  order: Order,
  tRef: React.MutableRefObject<(key: string) => string>,
  storeId: string,
  onNavigate?: (path: string) => void
): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const t = tRef.current;
  const title = t('notifications.newOrder');
  const body = `${t('order.label')} #${order.id.slice(-8).toUpperCase()} - ${order.customerInfo.name}`;

  // Build storeId-aware path
  const ordersPath = `/dashboard/${storeId}/orders`;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/logo_lulo.png',
      tag: `order-${order.id}`, // Prevent duplicate notifications
      requireInteraction: true, // Keep notification visible until user interacts
    });

    notification.onclick = () => {
      window.focus();
      if (onNavigate) {
        onNavigate(ordersPath);
      } else {
        // Fallback: dispatch custom event for navigation
        window.dispatchEvent(new CustomEvent('navigate-to-orders', {
          detail: { path: ordersPath }
        }));
      }
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

export const useOrderNotifications = ({
  storeId,
  enabled = true,
  onNavigate,
}: UseOrderNotificationsOptions): UseOrderNotificationsResult => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');
  const [lastSeenVersion, setLastSeenVersion] = useState(0); // Trigger recalc when markAllAsSeen is called

  // Keep t function in a ref to avoid subscription recreation on language change
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Track previous order IDs to detect new orders
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Memoize lastSeenTimestamp to avoid localStorage reads on every render
  const lastSeenTimestamp = useMemo(
    () => (storeId ? getLastSeenTimestamp(storeId) : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeId, lastSeenVersion] // Include lastSeenVersion to refresh after markAllAsSeen
  );

  // Memoize unreadCount to avoid filtering on every render
  const unreadCount = useMemo(() => {
    return orders.filter((order) => {
      const orderTime = order.createdAt instanceof Date
        ? order.createdAt.getTime()
        : new Date(order.createdAt).getTime();
      return orderTime > lastSeenTimestamp;
    }).length;
  }, [orders, lastSeenTimestamp]);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return;
    }

    markPermissionAsked();

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }, []);

  // Auto-request permission on first visit (once)
  useEffect(() => {
    if (
      'Notification' in window &&
      Notification.permission === 'default' &&
      !wasPermissionAsked() &&
      enabled &&
      storeId
    ) {
      // Delay permission request to avoid blocking initial load
      const timer = setTimeout(() => {
        requestNotificationPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [enabled, storeId, requestNotificationPermission]);

  // Subscribe to real-time orders
  useEffect(() => {
    // Reset refs when storeId changes or subscription is disabled
    if (!storeId || !enabled) {
      setOrders([]);
      setIsLoading(false);
      // Reset refs for next subscription
      previousOrderIdsRef.current = new Set();
      isFirstLoadRef.current = true;
      return;
    }

    // Reset refs when starting new subscription for a different store
    previousOrderIdsRef.current = new Set();
    isFirstLoadRef.current = true;
    setIsLoading(true);

    const unsubscribe = subscribeToStoreOrders(
      storeId,
      (newOrders) => {
        setOrders(newOrders);
        setIsLoading(false);

        // Detect new orders (not on first load)
        if (!isFirstLoadRef.current) {
          const newOrderIds = newOrders
            .filter((o) => !previousOrderIdsRef.current.has(o.id))
            .map((o) => o.id);

          // Show notification for each new order
          newOrderIds.forEach((orderId) => {
            const newOrder = newOrders.find((o) => o.id === orderId);
            if (newOrder && storeId) {
              showBrowserNotification(newOrder, tRef, storeId, onNavigate);
            }
          });
        } else {
          // First load - just mark as not first load anymore
          isFirstLoadRef.current = false;
        }

        // Always update the tracked order IDs
        previousOrderIdsRef.current = new Set(newOrders.map((o) => o.id));
      },
      (error) => {
        console.error('Order subscription error:', error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [storeId, enabled, onNavigate]); // Removed 't' from dependencies - using tRef instead

  // Mark all orders as seen - stable reference using useCallback
  const markAllAsSeen = useCallback(() => {
    if (!storeId || orders.length === 0) return;

    const latestOrderTime = Math.max(
      ...orders.map((order) => {
        const orderTime = order.createdAt instanceof Date
          ? order.createdAt.getTime()
          : new Date(order.createdAt).getTime();
        return orderTime;
      })
    );

    setLastSeenTimestamp(storeId, latestOrderTime);
    // Trigger recalculation of lastSeenTimestamp and unreadCount
    setLastSeenVersion((v) => v + 1);
  }, [storeId, orders]);

  return {
    orders,
    unreadCount,
    markAllAsSeen,
    notificationPermission,
    requestNotificationPermission,
    isLoading,
  };
};
