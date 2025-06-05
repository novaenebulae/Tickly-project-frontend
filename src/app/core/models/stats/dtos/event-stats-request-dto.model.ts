import { StatsTimeframe } from "../dependances/stats-timeframe.model";

/**
 * Paramètres pour les requêtes de statistiques d'événements
 */
export interface EventStatsRequestDto {
  eventId: number;
  timeframe?: StatsTimeframe;
  startDate?: Date;
  endDate?: Date;
  includeZoneBreakdown?: boolean;
  includeTimeSeries?: boolean;
  compareWith?: {
    eventId?: number;
    timeframe?: StatsTimeframe;
  };
}

/**
 * Paramètres pour les requêtes de données temporelles
 */
export interface EventTimeSeriesRequestDto {
  eventId: number;
  timeframe: StatsTimeframe;
  startDate?: Date;
  endDate?: Date;
  granularity?: 'hour' | 'day' | 'week';
  includeProjections?: boolean;
}
