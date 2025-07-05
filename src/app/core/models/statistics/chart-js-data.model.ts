/**
 * @file Models for Chart.js data structures used in statistics.
 * @licence Proprietary
 */

/**
 * Represents a dataset within a Chart.js chart.
 * Contains the data points and styling information.
 */
export interface ChartJsDataset {
  /** The name of the dataset */
  label: string;

  /** The numerical data points */
  data: number[];

  /** Colors for bar or doughnut charts */
  backgroundColor?: string | string[];

  /** Color for line charts */
  borderColor?: string | string[];

  /** Whether to fill the area under a line */
  fill?: boolean;
}

/**
 * A generic, reusable model for chart data.
 * Compatible with Chart.js library.
 */
export interface ChartJsDataDto {
  /** The suggested chart type (e.g., "bar", "line", "doughnut") */
  chartType: string;

  /** The labels for the X-axis or chart segments */
  labels: string[];

  /** A list of datasets to be plotted */
  datasets: ChartJsDataset[];
}
