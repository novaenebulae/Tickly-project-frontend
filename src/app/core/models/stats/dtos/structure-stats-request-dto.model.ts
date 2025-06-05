import { StatsTimeframe } from "../dependances/stats-timeframe.model";


/**
 * Paramètres pour les requêtes de statistiques de structure
 */
export interface StructureStatsRequestDto {
  structureId: number;
  timeframe: StatsTimeframe;
  startDate?: Date;
  endDate?: Date;
  includeCategoryBreakdown?: boolean;
  includeComparisons?: boolean;
  topEventsLimit?: number; // Pour limiter le nombre d'événements top
}

/**
 * Paramètres pour les statistiques d'overview des événements
 */
export interface EventsOverviewStatsRequestDto {
  structureId: number;
  includeFiltered?: boolean;
  filterParams?: {
    status?: string[];
    categories?: number[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}
