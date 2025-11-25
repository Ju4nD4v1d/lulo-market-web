import type * as React from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, AlertCircle, RefreshCw, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import styles from './TopProductsChart.module.css';

interface TopProductData {
  label: string;
  value: number;
  color?: string;
}

interface TopProductsChartProps {
  data: TopProductData[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  t: (key: string) => string;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({
  data,
  loading,
  error,
  onRefresh,
  t
}) => {
  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <Loader2 className={styles.loadingSpinner} />
            <p className={styles.loadingText}>{t('metrics.loadingProducts')}</p>
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorIconWrapper}>
            <AlertCircle className={styles.errorIcon} />
          </div>
          <p className={styles.errorTitle}>{t('metrics.unableToLoadProducts')}</p>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={onRefresh} className={styles.retryButton}>
            <RefreshCw className={styles.retryIcon} />
            {t('metrics.retry')}
          </button>
        </div>
      );
    }

    // No data state
    if (data.length === 0) {
      return (
        <div className={styles.noDataContainer}>
          <div className={styles.noDataIconWrapper}>
            <BarChart3 className={styles.noDataIcon} />
          </div>
          <p className={styles.noDataTitle}>{t('metrics.noProductSales')}</p>
          <p className={styles.noDataMessage}>{t('metrics.startSelling')}</p>
        </div>
      );
    }

    // Chart with data
    return (
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <defs>
              {data.map((product, index) => (
                <linearGradient key={`gradient-${index}`} id={`productGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={product.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={product.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [value, t('metrics.unitsSold')]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '12px'
              }}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#productGradient-${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <PieChartIcon className={styles.icon} />
        </div>
        <div>
          <h2 className={styles.title}>{t('metrics.topProducts')}</h2>
          <p className={styles.subtitle}>{t('metrics.topProductsSubtitle')}</p>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};
