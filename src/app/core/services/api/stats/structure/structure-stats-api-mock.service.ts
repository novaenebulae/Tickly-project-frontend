import {ApiConfigService} from '../../api-config.service';
import {inject, Injectable} from '@angular/core';
import {
  EventsOverviewStatsRequestDto,
  StructureStatsRequestDto
} from '../../../../models/stats/dtos/structure-stats-request-dto.model';
import {Observable} from 'rxjs';
import {StructureStatsModel} from '../../../../models/stats/structure/structure-global-stats.model';
import {
  EventsFilterStatsModel,
  EventsOverviewStatsModel
} from '../../../../models/stats/dependances/event-performance-snapshot.model';
import {
  generateStructureStatsData,
  mockStructureStats
} from '../../../../mocks/stats/structure/structures-stats-data.mock';


@Injectable({
  providedIn: 'root'
})
export class StructureStatsApiMockService {
  private apiConfig = inject(ApiConfigService);

  /**
   * Mock implementation pour récupérer les statistiques complètes d'une structure
   * @param structureId - ID de la structure
   * @param params - Paramètres de requête
   * @returns Observable<StructureStatsModel>
   */
  mockGetStructureStats(structureId: number, params?: Partial<StructureStatsRequestDto>): Observable<StructureStatsModel> {
    const endpointContext = `stats/structures/${structureId}`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, params);

    if (structureId <= 0 || structureId > 20) {
      return this.apiConfig.createMockError(404, `Mock: Structure with ID ${structureId} not found`);
    }

    // Pour la structure ID 3, utiliser les vraies données mock
    if (structureId === 3) {
      const timeframe = params?.timeframe || '1y';
      const structureData = generateStructureStatsData(structureId, timeframe);
      return this.apiConfig.createMockResponse(structureData);
    }

    // Pour les autres structures, générer des données simulées
    const simulatedStats = this.generateSimulatedStructureStats(structureId, params);
    return this.apiConfig.createMockResponse(simulatedStats);
  }

  /**
   * Mock implementation pour récupérer l'overview des événements d'une structure
   * @param structureId - ID de la structure
   * @param params - Paramètres de requête
   * @returns Observable<EventsOverviewStatsModel>
   */
  mockGetEventsOverviewStats(structureId: number, params?: EventsOverviewStatsRequestDto): Observable<EventsOverviewStatsModel> {
    const endpointContext = `stats/structures/${structureId}/events-overview`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, params);

    if (structureId <= 0 || structureId > 20) {
      return this.apiConfig.createMockError(404, `Mock: Structure with ID ${structureId} not found`);
    }

    // Générer des statistiques d'overview réalistes
    const overviewStats = this.generateEventsOverviewStats(structureId, params);
    return this.apiConfig.createMockResponse(overviewStats);
  }

  /**
   * Mock implementation pour récupérer les statistiques filtrées des événements
   * @param structureId - ID de la structure
   * @param filters - Filtres appliqués
   * @returns Observable<EventsFilterStatsModel>
   */
  mockGetEventsFilterStats(structureId: number, filters: any): Observable<EventsFilterStatsModel> {
    const endpointContext = `stats/structures/${structureId}/events-filter`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, filters);

    if (structureId <= 0 || structureId > 20) {
      return this.apiConfig.createMockError(404, `Mock: Structure with ID ${structureId} not found`);
    }

    const filterStats = this.generateEventsFilterStats(structureId, filters);
    return this.apiConfig.createMockResponse(filterStats);
  }

  /**
   * Mock implementation pour obtenir un dashboard consolidé de la structure
   * @param structureId - ID de la structure
   * @returns Observable contenant toutes les métriques importantes
   */
  mockGetStructureDashboard(structureId: number): Observable<any> {
    const endpointContext = `stats/structures/${structureId}/dashboard`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, null);

    if (structureId <= 0 || structureId > 20) {
      return this.apiConfig.createMockError(404, `Mock: Structure with ID ${structureId} not found`);
    }

    const dashboard = {
      structureStats: structureId === 3 ? mockStructureStats : this.generateSimulatedStructureStats(structureId),
      eventsOverview: this.generateEventsOverviewStats(structureId),
      recentActivity: this.generateRecentActivity(structureId),
      upcomingEvents: this.generateUpcomingEventsPreview(structureId),
      alerts: this.generateAlerts(structureId),
      lastUpdated: new Date()
    };

    return this.apiConfig.createMockResponse(dashboard);
  }

  /**
   * Génère des statistiques de structure simulées
   */
  private generateSimulatedStructureStats(structureId: number, params?: Partial<StructureStatsRequestDto>): StructureStatsModel {
    const seed = structureId * 456;
    const totalEvents = 5 + (seed % 25);
    const avgFillRate = 45 + (seed % 40);

    return {
      structureId,
      totalEventsCreated: totalEvents,
      totalTicketsSold: Math.floor(totalEvents * 200 * (avgFillRate / 100)),
      averageFillRate: Number(avgFillRate.toFixed(1)),
      performanceByMonth: this.generateMonthlyPerformance(structureId),
      performanceByCategory: this.generateCategoryPerformance(structureId),
      performanceVsPreviousYear: {
        value: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 25).toFixed(1)}% vs année précédente`,
        percentage: Number((Math.random() * 25).toFixed(1)),
        direction: Math.random() > 0.5 ? 'up' : 'down',
        comparedTo: 'same_period_last_year'
      },
      audienceInsights: {
        totalUniqueAttendees: Math.floor(1000 + Math.random() * 5000),
        returningCustomersRate: Number((15 + Math.random() * 30).toFixed(1)),
        averageTicketsPerCustomer: Number((1.2 + Math.random() * 1.0).toFixed(1)),
        ageDistribution: {
          '18-25': Number((15 + Math.random() * 10).toFixed(1)),
          '26-35': Number((25 + Math.random() * 15).toFixed(1)),
          '36-45': Number((20 + Math.random() * 10).toFixed(1)),
          '46-55': Number((15 + Math.random() * 10).toFixed(1)),
          '55+': Number((5 + Math.random() * 15).toFixed(1))
        }
      },
      growthTrends: {
        eventCreation: {
          value: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 30).toFixed(1)}% vs année précédente`,
          percentage: Number((Math.random() * 30).toFixed(1)),
          direction: Math.random() > 0.5 ? 'up' : 'down',
          comparedTo: 'same_period_last_year'
        },
        attendance: {
          value: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 20).toFixed(1)}% vs année précédente`,
          percentage: Number((Math.random() * 20).toFixed(1)),
          direction: Math.random() > 0.5 ? 'up' : 'down',
          comparedTo: 'same_period_last_year'
        }
      },
      topPerformingEvents: [],
      lastUpdated: new Date(),
      reportPeriod: {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 12)),
        endDate: new Date()
      }
    };
  }

  /**
   * Génère des données de performance mensuelle
   */
  private generateMonthlyPerformance(structureId: number) {
    const performance = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const eventsCount = Math.floor(Math.random() * 5);
      const totalCapacity = eventsCount * (200 + Math.random() * 300);
      const fillRate = 40 + Math.random() * 45;

      performance.push({
        month: month.getMonth() + 1,
        year: month.getFullYear(),
        eventsCount,
        totalTickets: Math.floor(totalCapacity * (fillRate / 100)),
        totalCapacity: Math.floor(totalCapacity),
        fillRate: Number(fillRate.toFixed(1))
      });
    }

    return performance;
  }

  /**
   * Génère des données de performance par catégorie
   */
  private generateCategoryPerformance(structureId: number) {
    const categories = [
      {id: 1, name: 'Concert'},
      {id: 4, name: 'Exposition'},
      {id: 6, name: 'Conférence'},
      {id: 7, name: 'Danse'}
    ];

    return categories.slice(0, 2 + Math.floor(Math.random() * 3)).map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      eventsCount: 1 + Math.floor(Math.random() * 8),
      averageFillRate: Number((40 + Math.random() * 45).toFixed(1)),
      totalTickets: Math.floor(Math.random() * 2000)
    }));
  }

  /**
   * Génère les statistiques d'overview des événements
   */
  private generateEventsOverviewStats(structureId: number, params?: EventsOverviewStatsRequestDto): EventsOverviewStatsModel {
    const totalEvents = 8 + Math.floor(Math.random() * 15);

    return {
      totalEvents,
      publishedEvents: Math.floor(totalEvents * 0.7),
      draftEvents: Math.floor(totalEvents * 0.2),
      upcomingEvents: Math.floor(totalEvents * 0.4),
      completedEvents: Math.floor(totalEvents * 0.5),
      cancelledEvents: Math.floor(totalEvents * 0.1),
      totalCapacityAllEvents: Math.floor(totalEvents * 300),
      totalTicketsAttributed: Math.floor(totalEvents * 200),
      globalFillRate: Number((40 + Math.random() * 40).toFixed(1)),
      eventsThisMonth: Math.floor(Math.random() * 5),
      eventsNextMonth: Math.floor(Math.random() * 6),
      eventCreationTrend: {
        description: `+${Math.floor(Math.random() * 3)} nouveaux événements ce mois`,
        value: Math.floor(Math.random() * 3),
        period: 'monthly',
        direction: 'up'
      },
      attendanceTrend: {
        description: `+${(Math.random() * 20).toFixed(1)}% de fréquentation`,
        value: Number((Math.random() * 20).toFixed(1)),
        period: 'monthly',
        direction: Math.random() > 0.3 ? 'up' : 'down'
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Génère les statistiques de filtres
   */
  private generateEventsFilterStats(structureId: number, filters: any): EventsFilterStatsModel {
    const totalCount = 8 + Math.floor(Math.random() * 15);
    const filteredCount = Math.floor(totalCount * (0.3 + Math.random() * 0.7));

    return {
      filteredCount,
      totalCount,
      statusBreakdown: {
        'draft': Math.floor(filteredCount * 0.2),
        'published': Math.floor(filteredCount * 0.6),
        'completed': Math.floor(filteredCount * 0.15),
        'cancelled': Math.floor(filteredCount * 0.05),
        'pending_approval': 0
      },
      categoryBreakdown: [
        {
          categoryId: 1,
          categoryName: 'Concert',
          eventCount: Math.floor(filteredCount * 0.4),
          fillRate: Number((50 + Math.random() * 30).toFixed(1))
        },
        {
          categoryId: 4,
          categoryName: 'Exposition',
          eventCount: Math.floor(filteredCount * 0.3),
          fillRate: Number((40 + Math.random() * 35).toFixed(1))
        }
      ],
      dateRangeMetrics: {
        averageFillRate: Number((45 + Math.random() * 30).toFixed(1)),
        totalCapacity: Math.floor(filteredCount * 300),
        totalTickets: Math.floor(filteredCount * 200),
        eventsPerDay: Number((filteredCount / 30).toFixed(1))
      }
    };
  }

  /**
   * Génère l'activité récente
   */
  private generateRecentActivity(structureId: number) {
    return [
      {
        type: 'new_reservation',
        message: 'Nouvelle réservation pour "Exposition Art Numérique"',
        timestamp: new Date(Date.now() - Math.random() * 86400000) // Dernière 24h
      },
      {
        type: 'event_published',
        message: 'Événement "Concert Jazz" publié',
        timestamp: new Date(Date.now() - Math.random() * 172800000) // Derniers 2 jours
      }
    ];
  }

  /**
   * Génère un aperçu des événements à venir
   */
  private generateUpcomingEventsPreview(structureId: number) {
    return [
      {
        id: Math.floor(Math.random() * 100),
        name: 'Prochain événement',
        startDate: new Date(Date.now() + Math.random() * 2592000000), // Prochain mois
        fillRate: Number((Math.random() * 80).toFixed(1))
      }
    ];
  }

  /**
   * Génère des alertes pour le dashboard
   */
  private generateAlerts(structureId: number) {
    const alerts = [];

    if (Math.random() > 0.7) {
      alerts.push({
        type: 'warning',
        message: 'Taux de remplissage faible pour l\'événement à venir',
        priority: 'medium'
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        type: 'info',
        message: 'Nouveau pic d\'activité détecté',
        priority: 'low'
      });
    }

    return alerts;
  }
}
