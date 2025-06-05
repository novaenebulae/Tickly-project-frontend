

// Helper pour générer des dates relatives
import {
  AudienceInsights,
  CategoryPerformance, GrowthTrends,
  MonthlyPerformance, StructureStatsModel
} from '../../../models/stats/structure/structure-global-stats.model';
import {EventPerformanceSnapshot} from '../../../models/stats/dependances/event-performance-snapshot.model';

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const today = new Date();

/**
 * Performance mensuelle de la structure ID 3 pour les 12 derniers mois
 */
const monthlyPerformanceData: MonthlyPerformance[] = [
  { month: 1, year: 2024, eventsCount: 2, totalTickets: 189, totalCapacity: 400, fillRate: 47.3 },
  { month: 2, year: 2024, eventsCount: 1, totalTickets: 145, totalCapacity: 300, fillRate: 48.3 },
  { month: 3, year: 2024, eventsCount: 3, totalTickets: 421, totalCapacity: 700, fillRate: 60.1 },
  { month: 4, year: 2024, eventsCount: 2, totalTickets: 267, totalCapacity: 400, fillRate: 66.8 },
  { month: 5, year: 2024, eventsCount: 1, totalTickets: 78, totalCapacity: 100, fillRate: 78.0 },
  { month: 6, year: 2024, eventsCount: 2, totalTickets: 892, totalCapacity: 3100, fillRate: 28.8 },
  { month: 7, year: 2024, eventsCount: 0, totalTickets: 0, totalCapacity: 0, fillRate: 0 },
  { month: 8, year: 2024, eventsCount: 1, totalTickets: 289, totalCapacity: 400, fillRate: 72.3 },
  { month: 9, year: 2024, eventsCount: 2, totalTickets: 567, totalCapacity: 800, fillRate: 70.9 },
  { month: 10, year: 2024, eventsCount: 1, totalTickets: 7234, totalCapacity: 10000, fillRate: 72.3 },
  { month: 11, year: 2024, eventsCount: 2, totalTickets: 156, totalCapacity: 200, fillRate: 78.0 },
  { month: 12, year: 2024, eventsCount: 1, totalTickets: 206, totalCapacity: 300, fillRate: 68.7 }
];

/**
 * Performance par catégorie d'événements pour la structure ID 3
 */
const categoryPerformanceData: CategoryPerformance[] = [
  {
    categoryId: 4,
    categoryName: 'Exposition',
    eventsCount: 8,
    averageFillRate: 62.4,
    totalTickets: 1678
  },
  {
    categoryId: 6,
    categoryName: 'Conférence',
    eventsCount: 4,
    averageFillRate: 71.2,
    totalTickets: 1456
  },
  {
    categoryId: 13,
    categoryName: 'Salon',
    eventsCount: 3,
    averageFillRate: 45.6,
    totalTickets: 6234
  },
  {
    categoryId: 11,
    categoryName: 'Bien-être',
    eventsCount: 2,
    averageFillRate: 89.4,
    totalTickets: 89
  },
  {
    categoryId: 8,
    categoryName: 'Cinéma',
    eventsCount: 1,
    averageFillRate: 55.0,
    totalTickets: 287
  }
];

/**
 * Insights sur l'audience de la structure ID 3
 */
const audienceInsightsData: AudienceInsights = {
  totalUniqueAttendees: 4521,
  returningCustomersRate: 23.7, // 23.7% de visiteurs récurrents
  averageTicketsPerCustomer: 2.1,
  ageDistribution: {
    '18-25': 18.4,
    '26-35': 32.1,
    '36-45': 24.6,
    '46-55': 16.2,
    '55+': 8.7
  },
  geographicDistribution: [
    { region: 'Marseille', percentage: 45.2, count: 2043 },
    { region: 'Aix-en-Provence', percentage: 18.7, count: 845 },
    { region: 'Autres Bouches-du-Rhône', percentage: 21.3, count: 963 },
    { region: 'Régions voisines', percentage: 12.1, count: 547 },
    { region: 'National/International', percentage: 2.7, count: 123 }
  ]
};

/**
 * Tendances de croissance de la structure ID 3
 */
const growthTrendsData: GrowthTrends = {
  eventCreation: {
    value: "+25% vs année précédente",
    percentage: 25,
    direction: 'up',
    comparedTo: 'same_period_last_year'
  },
  attendance: {
    value: "+12.8% vs année précédente",
    percentage: 12.8,
    direction: 'up',
    comparedTo: 'same_period_last_year'
  }
};

/**
 * Top événements performants de la structure ID 3
 */
const topPerformingEventsData: EventPerformanceSnapshot[] = [
  {
    eventId: 39,
    eventName: "Japan Expo Marseille 2024",
    fillRate: 72.3,
    ticketsAttributed: 7234,
    category: "Salon",
    startDate: addDays(today, -45)
  },
  {
    eventId: 34,
    eventName: "Salon du Bien-être et Méditation",
    fillRate: 89.4,
    ticketsAttributed: 447,
    category: "Bien-être",
    startDate: addDays(today, -80)
  },
  {
    eventId: 3,
    eventName: "Exposition Art Numérique Rétrospectif",
    fillRate: 68.7,
    ticketsAttributed: 206,
    category: "Exposition",
    startDate: addDays(today, -15)
  },
  {
    eventId: 19,
    eventName: "Conférence IA et Société",
    fillRate: 65.4,
    ticketsAttributed: 458,
    category: "Conférence",
    startDate: addDays(today, -120)
  },
  {
    eventId: 25,
    eventName: "Exposition Photo \"Lumières Urbaines\"",
    fillRate: 78.0,
    ticketsAttributed: 78,
    category: "Exposition",
    startDate: addDays(today, -90)
  }
];

/**
 * Statistiques complètes de la structure ID 3 - Espace Culturel "Perspectives"
 */
export const mockStructureStats: StructureStatsModel = {
  structureId: 3,

  // Performance générale
  totalEventsCreated: 18,
  totalTicketsSold: 9944,
  averageFillRate: 63.8,

  // Métriques temporelles
  performanceByMonth: monthlyPerformanceData,
  performanceByCategory: categoryPerformanceData,

  // Comparaisons
  performanceVsPreviousYear: {
    value: "+12.8% vs année précédente",
    percentage: 12.8,
    direction: 'up',
    comparedTo: 'same_period_last_year'
  },
  fillRateVsIndustry: {
    value: "+8.3% vs moyenne secteur",
    percentage: 8.3,
    direction: 'up',
    comparedTo: 'same_period_last_year'
  },

  // Audience insights
  audienceInsights: audienceInsightsData,

  // Tendances
  growthTrends: growthTrendsData,

  // Top events
  topPerformingEvents: topPerformingEventsData,

  lastUpdated: new Date(),
  reportPeriod: {
    startDate: addMonths(today, -12),
    endDate: today
  }
};

/**
 * Génère des données de structure pour différentes périodes
 */
export function generateStructureStatsData(structureId: number, timeframe: string): StructureStatsModel {
  const baseData = { ...mockStructureStats };
  baseData.structureId = structureId;

  switch (timeframe) {
    case '3m':
      baseData.performanceByMonth = baseData.performanceByMonth.slice(-3);
      break;
    case '6m':
      baseData.performanceByMonth = baseData.performanceByMonth.slice(-6);
      break;
    case '1y':
      // Données complètes déjà définies
      break;
    default:
      baseData.performanceByMonth = baseData.performanceByMonth.slice(-6);
  }

  return baseData;
}
