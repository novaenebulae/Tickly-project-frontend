/**
 * Types génériques pour les métriques et comparaisons
 */
export interface ComparisonMetric {
  value: string; // "+18% vs J-7"
  percentage: number; // 18
  direction: 'up' | 'down' | 'stable';
  comparedTo: 'previous_week' | 'previous_month' | 'same_period_last_year';
}

export interface TrendMetric {
  description: string; // "+80 réservations hier"
  value: number; // 80
  period: 'daily' | 'weekly' | 'monthly';
  direction: 'up' | 'down' | 'stable';
}

export interface MetricValue {
  current: number;
  previous?: number;
  change?: number;
  changePercentage?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface StatsWidget {
  id: string;
  title: string;
  metric: MetricValue;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  format: 'number' | 'percentage' | 'currency';
}
