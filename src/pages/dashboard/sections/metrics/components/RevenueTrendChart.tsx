import type * as React from 'react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, AlertCircle, Info, RefreshCw, LineChart as LineChartIcon } from 'lucide-react';
import { colorPalette, currencyFormatter } from '../utils/chartConfig';
import styles from './RevenueTrendChart.module.css';

interface TrendDataPoint {
  label: string;
  value: number;
}

interface RevenueTrendChartProps {
  data: TrendDataPoint[];
  loading: boolean;
  error: string | null;
  granularity: 'week' | 'month';
  onRefresh: () => void;
  t: (key: string) => string;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data,
  loading,
  error,
  granularity,
  onRefresh,
  t
}) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <Loader2 className={styles.loadingSpinner} />
            <p className={styles.loadingText}>{t('metrics.loadingRevenue')}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorIconWrapper}>
            <AlertCircle className={styles.errorIcon} />
          </div>
          <p className={styles.errorTitle}>{t('metrics.unableToLoadRevenue')}</p>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={onRefresh} className={styles.retryButton}>
            <RefreshCw className={styles.retryIcon} />
            {t('metrics.retry')}
          </button>
        </div>
      );
    }

    return (
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorPalette.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colorPalette.primary} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              angle={granularity === 'month' ? -45 : 0}
              textAnchor={granularity === 'month' ? 'end' : 'middle'}
              height={granularity === 'month' ? 60 : 30}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(v) => currencyFormatter.format(Number(v))}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [currencyFormatter.format(value), t('metrics.revenue')]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colorPalette.primary}
              strokeWidth={3}
              fill="url(#revenueGradient)"
              dot={{ fill: colorPalette.primary, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: colorPalette.primary, strokeWidth: 3, fill: '#FFF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        {data.length < 2 && (
          <div className={styles.noDataOverlay}>
            <div className={styles.infoIconWrapper}>
              <Info className={styles.infoIcon} />
            </div>
            <p className={styles.noDataTitle}>{t('metrics.buildingInsights')}</p>
            <p className={styles.noDataMessage}>{t('metrics.moreDataSoon')}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.iconWrapper}>
            <LineChartIcon className={styles.icon} />
          </div>
          <div>
            <h2 className={styles.title}>{t('metrics.revenueTrend')}</h2>
            <p className={styles.subtitle}>{t('metrics.revenueTrendSubtitle')}</p>
          </div>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};
