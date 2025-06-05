import { EventStatus } from '../../event/event.model';
import { TrendMetric } from './comparison-metric.model';

/**
 * Snapshot de performance d'un événement
 */
export interface EventPerformanceSnapshot {
  eventId: number;
  eventName: string;
  fillRate: number;
  ticketsAttributed: number;
  category: string;
  startDate: Date;
}

/**
 * Statistiques globales des événements d'une structure
 */
export interface EventsOverviewStatsModel {
  // Compteurs basiques
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;

  // Métriques avancées
  totalCapacityAllEvents: number;
  totalTicketsAttributed: number;
  globalFillRate: number;

  // Performance par période
  eventsThisMonth: number;
  eventsNextMonth: number;

  // Tendances
  eventCreationTrend: TrendMetric;
  attendanceTrend: TrendMetric;

  // Top performers
  mostPopularEvent?: EventPerformanceSnapshot;
  highestFillRateEvent?: EventPerformanceSnapshot;

  lastUpdated: Date;
}

/**
 * Statistiques basées sur les filtres appliqués
 */
export interface EventsFilterStatsModel {
  filteredCount: number;
  totalCount: number;

  // Breakdown par statut
  statusBreakdown: {
    [status in EventStatus]: number;
  };

  // Breakdown par catégorie
  categoryBreakdown: Array<{
    categoryId: number;
    categoryName: string;
    eventCount: number;
    fillRate: number;
  }>;

  // Métriques temporelles
  dateRangeMetrics?: {
    averageFillRate: number;
    totalCapacity: number;
    totalTickets: number;
    eventsPerDay: number;
  };
}
