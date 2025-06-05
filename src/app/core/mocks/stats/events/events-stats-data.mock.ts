import {
  EventStatsModel,
  EventTimeSeriesDataPoint,
  EventTimeSeriesModel
} from '../../../models/stats/dependances/event-stats-model.model';

// Helper pour générer des dates relatives
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

const today = new Date();

/**
 * Statistiques pour l'événement ID 3 - "Exposition Art Numérique Rétrospectif"
 * Structure ID 3 - Espace Culturel "Perspectives"
 * Événement en cours depuis 15 jours, se termine dans 60 jours
 */
export const mockEventStats: EventStatsModel = {
  // Métriques de base
  fillRate: 68.5, // 68.5% de remplissage
  ticketsAttributed: 206, // Sur 300 places disponibles
  totalCapacity: 300,
  availableTickets: 94,

  // Réservations
  uniqueReservations: 142, // 142 réservations uniques
  avgTicketsPerReservation: 1.45, // Moyenne de 1.45 billets par réservation

  // Métriques de scan/présence (exposition en cours)
  ticketsScanned: 187, // 187 personnes ont déjà visité
  noShowRate: 9.2, // 9.2% de no-show
  scanRate: 90.8, // 90.8% des billets attribués ont été scannés

  // Tendances et comparaisons
  fillRateComparison: {
    value: "+12.3% vs période précédente",
    percentage: 12.3,
    direction: 'up',
    comparedTo: 'previous_month'
  },
  ticketsAttributedComparison: {
    value: "+28 vs semaine dernière",
    percentage: 15.7,
    direction: 'up',
    comparedTo: 'previous_week'
  },
  newReservationsTrend: {
    description: "+8 nouvelles réservations hier",
    value: 8,
    period: 'daily',
    direction: 'up'
  },

  // Données temporelles
  lastUpdated: new Date(),
  dataGeneratedAt: addHours(new Date(), -2)
};

/**
 * Données temporelles pour l'événement (évolution sur 30 derniers jours)
 */
export const mockEventTimeSeries: EventTimeSeriesModel = {
  eventId: 3,
  eventName: "Exposition Art Numérique Rétrospectif",
  timeframe: '30d',
  generatedAt: new Date(),
  dataPoints: [
    // Semaine -4 (début de l'exposition)
    { timestamp: addDays(today, -30), fillRate: 0, ticketsAttributed: 0, cumulativeReservations: 0, dailyReservations: 0 },
    { timestamp: addDays(today, -29), fillRate: 2.3, ticketsAttributed: 7, cumulativeReservations: 5, dailyReservations: 5 },
    { timestamp: addDays(today, -28), fillRate: 5.7, ticketsAttributed: 17, cumulativeReservations: 12, dailyReservations: 7 },
    { timestamp: addDays(today, -27), fillRate: 8.0, ticketsAttributed: 24, cumulativeReservations: 18, dailyReservations: 6 },
    { timestamp: addDays(today, -26), fillRate: 12.3, ticketsAttributed: 37, cumulativeReservations: 26, dailyReservations: 8 },
    { timestamp: addDays(today, -25), fillRate: 16.7, ticketsAttributed: 50, cumulativeReservations: 35, dailyReservations: 9 },
    { timestamp: addDays(today, -24), fillRate: 19.0, ticketsAttributed: 57, cumulativeReservations: 41, dailyReservations: 6 },

    // Semaine -3
    { timestamp: addDays(today, -23), fillRate: 23.0, ticketsAttributed: 69, cumulativeReservations: 49, dailyReservations: 8 },
    { timestamp: addDays(today, -22), fillRate: 27.7, ticketsAttributed: 83, cumulativeReservations: 58, dailyReservations: 9 },
    { timestamp: addDays(today, -21), fillRate: 31.7, ticketsAttributed: 95, cumulativeReservations: 67, dailyReservations: 9 },
    { timestamp: addDays(today, -20), fillRate: 35.3, ticketsAttributed: 106, cumulativeReservations: 75, dailyReservations: 8 },
    { timestamp: addDays(today, -19), fillRate: 39.0, ticketsAttributed: 117, cumulativeReservations: 83, dailyReservations: 8 },
    { timestamp: addDays(today, -18), fillRate: 42.3, ticketsAttributed: 127, cumulativeReservations: 90, dailyReservations: 7 },
    { timestamp: addDays(today, -17), fillRate: 45.0, ticketsAttributed: 135, cumulativeReservations: 96, dailyReservations: 6 },

    // Semaine -2
    { timestamp: addDays(today, -16), fillRate: 48.7, ticketsAttributed: 146, cumulativeReservations: 104, dailyReservations: 8 },
    { timestamp: addDays(today, -15), fillRate: 52.0, ticketsAttributed: 156, cumulativeReservations: 111, dailyReservations: 7 },
    { timestamp: addDays(today, -14), fillRate: 55.7, ticketsAttributed: 167, cumulativeReservations: 119, dailyReservations: 8 },
    { timestamp: addDays(today, -13), fillRate: 58.7, ticketsAttributed: 176, cumulativeReservations: 125, dailyReservations: 6 },
    { timestamp: addDays(today, -12), fillRate: 61.3, ticketsAttributed: 184, cumulativeReservations: 130, dailyReservations: 5 },
    { timestamp: addDays(today, -11), fillRate: 63.7, ticketsAttributed: 191, cumulativeReservations: 135, dailyReservations: 5 },
    { timestamp: addDays(today, -10), fillRate: 65.7, ticketsAttributed: 197, cumulativeReservations: 139, dailyReservations: 4 },

    // Semaine -1
    { timestamp: addDays(today, -9), fillRate: 66.3, ticketsAttributed: 199, cumulativeReservations: 140, dailyReservations: 1 },
    { timestamp: addDays(today, -8), fillRate: 66.7, ticketsAttributed: 200, cumulativeReservations: 140, dailyReservations: 0 },
    { timestamp: addDays(today, -7), fillRate: 67.0, ticketsAttributed: 201, cumulativeReservations: 141, dailyReservations: 1 },
    { timestamp: addDays(today, -6), fillRate: 67.3, ticketsAttributed: 202, cumulativeReservations: 141, dailyReservations: 0 },
    { timestamp: addDays(today, -5), fillRate: 67.7, ticketsAttributed: 203, cumulativeReservations: 141, dailyReservations: 0 },
    { timestamp: addDays(today, -4), fillRate: 68.0, ticketsAttributed: 204, cumulativeReservations: 142, dailyReservations: 1 },
    { timestamp: addDays(today, -3), fillRate: 68.3, ticketsAttributed: 205, cumulativeReservations: 142, dailyReservations: 0 },

    // Cette semaine
    { timestamp: addDays(today, -2), fillRate: 68.5, ticketsAttributed: 206, cumulativeReservations: 142, dailyReservations: 0 },
    { timestamp: addDays(today, -1), fillRate: 68.5, ticketsAttributed: 206, cumulativeReservations: 142, dailyReservations: 0 },
    { timestamp: today, fillRate: 68.5, ticketsAttributed: 206, cumulativeReservations: 142, dailyReservations: 0 },
  ]
};

/**
 * Génère des données temporelles pour différentes périodes
 */
export function generateEventTimeSeriesData(eventId: number, timeframe: string): EventTimeSeriesModel {
  const baseData = { ...mockEventTimeSeries };
  baseData.eventId = eventId;
  baseData.timeframe = timeframe;

  switch (timeframe) {
    case '7d':
      baseData.dataPoints = baseData.dataPoints.slice(-7);
      break;
    case '30d':
      // Données complètes déjà définies
      break;
    case '3m':
      // Simulation de 3 mois avec des données agrégées par semaine
      baseData.dataPoints = generateWeeklyData(90);
      break;
    default:
      baseData.dataPoints = baseData.dataPoints.slice(-30);
  }

  return baseData;
}

function generateWeeklyData(totalDays: number): EventTimeSeriesDataPoint[] {
  const points: EventTimeSeriesDataPoint[] = [];
  const weeks = Math.floor(totalDays / 7);

  for (let i = weeks; i >= 0; i--) {
    const weekStart = addDays(today, -i * 7);
    const fillRate = Math.min(68.5, Math.max(0, 68.5 - (i * 5) + Math.random() * 10));
    const ticketsAttributed = Math.floor((fillRate / 100) * 300);

    points.push({
      timestamp: weekStart,
      fillRate: Number(fillRate.toFixed(1)),
      ticketsAttributed,
      cumulativeReservations: Math.floor(ticketsAttributed / 1.45),
      dailyReservations: Math.floor(Math.random() * 5)
    });
  }

  return points;
}
