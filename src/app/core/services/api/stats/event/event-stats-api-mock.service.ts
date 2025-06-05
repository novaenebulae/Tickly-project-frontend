import {inject, Injectable} from '@angular/core';
import {ApiConfigService} from '../../api-config.service';
import {
  EventStatsRequestDto,
  EventTimeSeriesRequestDto
} from '../../../../models/stats/dtos/event-stats-request-dto.model';
import {Observable} from 'rxjs';
import {EventStatsModel, EventTimeSeriesModel} from '../../../../models/stats/dependances/event-stats-model.model';
import {generateEventTimeSeriesData, mockEventStats} from '../../../../mocks/stats/events/events-stats-data.mock';
import {StatsTimeframe} from '../../../../models/stats/dependances/stats-timeframe.model';


@Injectable({
  providedIn: 'root'
})
export class EventStatsApiMockService {
  private apiConfig = inject(ApiConfigService);

  /**
   * Mock implementation pour récupérer les statistiques d'un événement
   * @param eventId - ID de l'événement
   * @param params - Paramètres de requête optionnels
   * @returns Observable<EventStatsModel>
   */
  mockGetEventStats(eventId: number, params?: Partial<EventStatsRequestDto>): Observable<EventStatsModel> {
    const endpointContext = `stats/events/${eventId}`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, params);

    // Vérifier que l'événement existe (simulation)
    if (eventId <= 0 || eventId > 100) {
      return this.apiConfig.createMockError(404, `Mock: Event with ID ${eventId} not found`);
    }

    // Pour l'événement ID 3, utiliser les vraies données mock
    if (eventId === 3) {
      return this.apiConfig.createMockResponse(mockEventStats);
    }

    // Pour les autres événements, générer des données simulées
    const simulatedStats = this.generateSimulatedEventStats(eventId, params);
    return this.apiConfig.createMockResponse(simulatedStats);
  }

  /**
   * Mock implementation pour récupérer les données temporelles d'un événement
   * @param eventId - ID de l'événement
   * @param params - Paramètres de la requête temporelle
   * @returns Observable<EventTimeSeriesModel>
   */
  mockGetEventTimeSeries(eventId: number, params: EventTimeSeriesRequestDto): Observable<EventTimeSeriesModel> {
    const endpointContext = `stats/events/${eventId}/timeseries`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, params);

    if (eventId <= 0 || eventId > 100) {
      return this.apiConfig.createMockError(404, `Mock: Event with ID ${eventId} not found`);
    }

    if (!params.timeframe) {
      return this.apiConfig.createMockError(400, 'Mock: timeframe parameter is required');
    }

    // Pour l'événement ID 3, utiliser les vraies données
    if (eventId === 3) {
      const timeSeriesData = generateEventTimeSeriesData(eventId, params.timeframe);
      return this.apiConfig.createMockResponse(timeSeriesData);
    }

    // Pour les autres événements, générer des données simulées
    const simulatedTimeSeries = this.generateSimulatedTimeSeries(eventId, params);
    return this.apiConfig.createMockResponse(simulatedTimeSeries);
  }

  /**
   * Mock implementation pour comparer les statistiques de plusieurs événements
   * @param eventIds - Liste des IDs d'événements à comparer
   * @param timeframe - Période de comparaison
   * @returns Observable contenant les données de comparaison
   */
  mockCompareEventStats(eventIds: number[], timeframe: StatsTimeframe): Observable<any> {
    const endpointContext = `stats/events/compare`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, { eventIds, timeframe });

    if (!eventIds || eventIds.length === 0) {
      return this.apiConfig.createMockError(400, 'Mock: At least one event ID is required');
    }

    if (eventIds.length > 5) {
      return this.apiConfig.createMockError(400, 'Mock: Cannot compare more than 5 events at once');
    }

    const comparisonData = eventIds.map(eventId => {
      if (eventId === 3) {
        return {
          eventId,
          eventName: "Exposition Art Numérique Rétrospectif",
          stats: mockEventStats,
          timeSeries: generateEventTimeSeriesData(eventId, timeframe)
        };
      }

      return {
        eventId,
        eventName: `Event ${eventId}`,
        stats: this.generateSimulatedEventStats(eventId),
        timeSeries: this.generateSimulatedTimeSeries(eventId, {
          eventId,
          timeframe,
          granularity: 'day'
        })
      };
    });

    return this.apiConfig.createMockResponse({
      timeframe,
      eventsData: comparisonData,
      generatedAt: new Date()
    });
  }

  /**
   * Génère des statistiques simulées pour un événement
   */
  private generateSimulatedEventStats(eventId: number, params?: Partial<EventStatsRequestDto>): EventStatsModel {
    // Générer des données cohérentes basées sur l'ID
    const seed = eventId * 123; // Seed pour la reproductibilité
    const capacity = 150 + (seed % 500); // Capacité entre 150 et 650
    const fillRate = 40 + (seed % 50); // Taux de remplissage entre 40% et 90%
    const ticketsAttributed = Math.floor((fillRate / 100) * capacity);

    return {
      fillRate: Number(fillRate.toFixed(1)),
      ticketsAttributed,
      totalCapacity: capacity,
      availableTickets: capacity - ticketsAttributed,
      uniqueReservations: Math.floor(ticketsAttributed / 1.8),
      avgTicketsPerReservation: Number((1.2 + Math.random() * 1.0).toFixed(2)),
      ticketsScanned: Math.floor(ticketsAttributed * (0.7 + Math.random() * 0.25)),
      noShowRate: Number((5 + Math.random() * 15).toFixed(1)),
      scanRate: Number((70 + Math.random() * 25).toFixed(1)),
      fillRateComparison: {
        value: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 20).toFixed(1)}% vs période précédente`,
        percentage: Number((Math.random() * 20).toFixed(1)),
        direction: Math.random() > 0.5 ? 'up' : 'down',
        comparedTo: 'previous_month'
      },
      ticketsAttributedComparison: {
        value: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 50)} vs semaine dernière`,
        percentage: Number((Math.random() * 30).toFixed(1)),
        direction: Math.random() > 0.5 ? 'up' : 'down',
        comparedTo: 'previous_week'
      },
      newReservationsTrend: {
        description: `+${Math.floor(Math.random() * 10)} nouvelles réservations hier`,
        value: Math.floor(Math.random() * 10),
        period: 'daily',
        direction: 'up'
      },
      lastUpdated: new Date(),
      dataGeneratedAt: new Date()
    };
  }

  /**
   * Génère des données temporelles simulées
   */
  private generateSimulatedTimeSeries(eventId: number, params: EventTimeSeriesRequestDto): EventTimeSeriesModel {
    const days = params.timeframe === '7d' ? 7 : params.timeframe === '30d' ? 30 : 90;
    const dataPoints = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const progress = (days - i) / days;
      const fillRate = progress * (40 + (eventId % 50)) + Math.random() * 5;
      const capacity = 150 + (eventId % 500);

      dataPoints.push({
        timestamp: date,
        fillRate: Number(Math.min(fillRate, 95).toFixed(1)),
        ticketsAttributed: Math.floor((fillRate / 100) * capacity),
        cumulativeReservations: Math.floor((fillRate / 100) * capacity / 1.8),
        dailyReservations: Math.floor(Math.random() * 8)
      });
    }

    return {
      eventId,
      eventName: `Event ${eventId}`,
      timeframe: params.timeframe,
      generatedAt: new Date(),
      dataPoints
    };
  }
}
