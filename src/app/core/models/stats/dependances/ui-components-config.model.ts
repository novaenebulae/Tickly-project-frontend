import { ChartType } from 'chart.js';

/**
 * Configuration d'un KPI
 */
export interface KPIConfig {
  label: string;
  value: number;
  unit?: string;
  trend?: TrendConfig;
  icon?: string;
  color?: string;
  target?: number;
  status?: 'excellent' | 'good' | 'average' | 'poor';
  description?: string;
}

/**
 * Configuration d'une tendance
 */
export interface TrendConfig {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
  isPositive?: boolean; // Permet d'inverser la logique (ex: réduction des coûts)
}

/**
 * Configuration d'un graphique
 */
export interface StatsChartConfig {
  id: string;
  type: ChartType;
  title: string;
  subtitle?: string;
  data: any;
  height?: number;
  loading?: boolean;
  error?: string;
  isEmpty?: boolean;
  showExport?: boolean;
  showFullscreen?: boolean;
  refreshable?: boolean;
}

/**
 * Configuration d'un widget
 */
export interface WidgetConfig {
  id: string;
  title: string;
  subtitle?: string;
  type: 'kpi' | 'chart' | 'table' | 'list' | 'custom';
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  data?: any;
  loading?: boolean;
  error?: string;
  actions?: WidgetAction[];
}

/**
 * Action d'un widget
 */
export interface WidgetAction {
  id: string;
  label: string;
  icon?: string;
  handler: () => void;
  disabled?: boolean;
}

/**
 * Configuration d'un filtre
 */
export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange' | 'toggle' | 'slider';
  options?: FilterOption[];
  value?: any;
  placeholder?: string;
  required?: boolean;
}

/**
 * Option d'un filtre
 */
export interface FilterOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
}

/**
 * Configuration d'un dashboard
 */
export interface DashboardConfig {
  id: string;
  title: string;
  subtitle?: string;
  layout: DashboardLayout;
  widgets: WidgetConfig[];
  filters?: FilterConfig[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Layout d'un dashboard
 */
export interface DashboardLayout {
  columns: number;
  gaps: number;
  responsive: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

/**
 * État de chargement
 */
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

/**
 * État d'erreur
 */
export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  recoverable?: boolean;
}

/**
 * Configuration d'export
 */
export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'png' | 'jpeg';
  filename?: string;
  includeCharts?: boolean;
  includeData?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Période temporelle
 */
export interface TimePeriod {
  label: string;
  value: string;
  days: number;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

/**
 * Alertes et notifications
 */
export interface StatsAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    handler: () => void;
  };
  dismissible?: boolean;
  autoHide?: boolean;
  timestamp: Date;
}

/**
 * Configuration de comparaison
 */
export interface ComparisonConfig {
  items: ComparisonItem[];
  metric: string;
  period: TimePeriod;
  chartType: ChartType;
}

/**
 * Élément de comparaison
 */
export interface ComparisonItem {
  id: number;
  name: string;
  color?: string;
  data?: any;
  selected?: boolean;
}

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Configuration de table
 */
export interface TableConfig {
  columns: TableColumn[];
  data: any[];
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  loading?: boolean;
  empty?: {
    title: string;
    message: string;
    icon?: string;
  };
}

/**
 * Colonne de table
 */
export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'percentage' | 'date' | 'currency' | 'status' | 'actions';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any, row: any) => string;
}

/**
 * Métadonnées de performance
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  dataFreshness: Date;
  cacheHit: boolean;
  apiCalls: number;
}

/**
 * Configuration de thème
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg';
}
