import { ComparisonMetric } from "../dependances/comparison-metric.model";
import { EventPerformanceSnapshot } from "../dependances/event-performance-snapshot.model";

/**
 * Performance mensuelle d'une structure
 */
export interface MonthlyPerformance {
  month: number;
  year: number;
  eventsCount: number;
  totalTickets: number;
  totalCapacity: number;
  fillRate: number;
}

/**
 * Performance par catégorie d'événements
 */
export interface CategoryPerformance {
  categoryId: number;
  categoryName: string;
  eventsCount: number;
  averageFillRate: number;
  totalTickets: number;
}

/**
 * Insights sur l'audience
 */
export interface AudienceInsights {
  totalUniqueAttendees: number;
  returningCustomersRate: number;
  averageTicketsPerCustomer: number;
  ageDistribution?: {
    '18-25': number;
    '26-35': number;
    '36-45': number;
    '46-55': number;
    '55+': number;
  };
  geographicDistribution?: Array<{
    region: string;
    percentage: number;
    count: number;
  }>;
}

/**
 * Tendances de croissance
 */
export interface GrowthTrends {
  eventCreation: ComparisonMetric;
  attendance: ComparisonMetric;
}

/**
 * Statistiques globales de la structure
 */
export interface StructureStatsModel {
  structureId: number;

  // Performance générale
  totalEventsCreated: number;
  totalTicketsSold: number;
  averageFillRate: number;

  // Métriques temporelles
  performanceByMonth: MonthlyPerformance[];
  performanceByCategory: CategoryPerformance[];

  // Comparaisons
  performanceVsPreviousYear: ComparisonMetric;
  fillRateVsIndustry?: ComparisonMetric;

  // Audience insights
  audienceInsights: AudienceInsights;

  // Tendances
  growthTrends: GrowthTrends;

  // Top events
  topPerformingEvents: EventPerformanceSnapshot[];

  lastUpdated: Date;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
}
