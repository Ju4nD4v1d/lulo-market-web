/**
 * Analytics utilities
 * Re-exports from analyticsApi for use by hooks
 */

export type { CurrentWeekMetrics } from '../services/api/analyticsApi';

export {
  getCurrentWeekMetrics,
  getPreviousWeekMetrics,
  subscribeToCurrentWeekMetrics,
} from '../services/api/analyticsApi';
