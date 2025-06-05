import { ChartConfiguration, ChartType } from 'chart.js';

/**
 * Types de charts supportés
 */
export type SupportedChartType = 'line' | 'bar' | 'doughnut' | 'pie';

/**
 * Configuration de base pour les charts
 */
export interface ChartConfigModel {
  type: SupportedChartType;
  title: string;
  data: any;
  options: any;
}

/**
 * Données formatées pour Chart.js
 */
export interface ChartDataModel {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }>;
}

/**
 * Configuration spécialisée pour les charts d'évolution
 */
export interface TimeSeriesChartConfig extends ChartConfigModel {
  type: 'line';
  timeRange: {
    start: Date;
    end: Date;
  };
  granularity: 'hour' | 'day' | 'week' | 'month';
}

/**
 * Configuration pour les charts de performance
 */
export interface PerformanceChartConfig extends ChartConfigModel {
  type: 'doughnut' | 'bar';
  thresholds?: {
    warning: number;
    danger: number;
  };
}
