import { ComparisonMetric, TrendMetric } from './comparison-metric.model';

/**
 * Statistiques détaillées d'un événement
 */
export interface EventStatsModel {
  // Métriques de base
  fillRate: number; // Pourcentage 0-100
  ticketsAttributed: number;
  totalCapacity: number;
  availableTickets: number;

  // Réservations
  uniqueReservations: number;
  avgTicketsPerReservation: number;

  // Métriques de scan/présence
  ticketsScanned: number;
  noShowRate: number; // Pourcentage 0-100
  scanRate: number; // Pourcentage de tickets scannés

  // Tendances et comparaisons
  fillRateComparison: ComparisonMetric;
  ticketsAttributedComparison: ComparisonMetric;
  newReservationsTrend: TrendMetric;

  // Données temporelles
  lastUpdated: Date;
  dataGeneratedAt: Date;
}

/**
 * Statistiques par zone d'un événement
 */
export interface EventZoneStatsModel {
  zoneId: number;
  zoneName: string;
  capacity: number;
  ticketsAttributed: number;
  ticketsScanned: number;
  fillRate: number;
  scanRate: number;
  averageAge?: number;
  genderDistribution?: {
    male: number;
    female: number;
    other: number;
  };
}

/**
 * Point de données pour les charts temporels d'événement
 */
export interface EventTimeSeriesDataPoint {
  timestamp: Date;
  fillRate: number;
  ticketsAttributed: number;
  cumulativeReservations: number;
  dailyReservations: number;
}

/**
 * Données temporelles complètes pour un événement
 */
export interface EventTimeSeriesModel {
  eventId: number;
  eventName: string;
  dataPoints: EventTimeSeriesDataPoint[];
  generatedAt: Date;
  timeframe: string; // '7d', '30d', etc.
}
