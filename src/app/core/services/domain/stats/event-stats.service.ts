import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, catchError, tap, switchMap, finalize } from 'rxjs/operators';
import { StatsApiService } from '../../api/stats/stats-api.service';
import { NotificationService } from '../utilities/notification.service';
import {EventStatsModel, EventTimeSeriesModel} from '../../../models/stats/dependances/event-stats-model.model';
import { EventStatsRequestDto, EventTimeSeriesRequestDto} from '../../../models/stats/dtos/event-stats-request-dto.model';
import {StatsTimeframe} from '../../../models/stats/dependances/stats-timeframe.model';

@Injectable({
  providedIn: 'root'
})
export class EventStatsService {
  private statsApi = inject(StatsApiService);
  private notification = inject(NotificationService);

  // ===== STATE MANAGEMENT =====

  // Signal pour les statistiques de l'événement actuellement sélectionné
  private currentEventStatsSig = signal<EventStatsModel | null>(null);
  public readonly currentEventStats = computed(() => this.currentEventStatsSig());

  // Signal pour les données temporelles de l'événement
  private currentEventTimeSeriesSig = signal<EventTimeSeriesModel | null>(null);
  public readonly currentEventTimeSeries = computed(() => this.currentEventTimeSeriesSig());

  // Signal pour l'état de chargement
  private loadingStatsSig = signal<boolean>(false);
  public readonly isLoadingStats = computed(() => this.loadingStatsSig());

  // Signal pour l'événement actuellement suivi
  private currentEventIdSig = signal<number | null>(null);
  public readonly currentEventId = computed(() => this.currentEventIdSig());

  // Cache des données de comparaison
  private comparisonDataSubject = new BehaviorSubject<any>(null);
  public readonly comparisonData$ = this.comparisonDataSubject.asObservable();

  // ===== MÉTHODES PUBLIQUES =====

  /**
   * Charge les statistiques complètes d'un événement
   * @param eventId - ID de l'événement
   * @param params - Paramètres optionnels de requête
   * @param forceRefresh - Force le rechargement même si les données sont déjà en cache
   * @returns Observable<EventStatsModel>
   */
  loadEventStats(eventId: number, params?: Partial<EventStatsRequestDto>, forceRefresh = false): Observable<EventStatsModel> {
    // Si c'est le même événement et pas de force refresh, retourner les données en cache
    if (!forceRefresh && this.currentEventIdSig() === eventId && this.currentEventStatsSig()) {
      return of(this.currentEventStatsSig()!);
    }

    this.loadingStatsSig.set(true);
    this.currentEventIdSig.set(eventId);

    return this.statsApi.getEventStats(eventId, params).pipe(
      tap(stats => {
        this.currentEventStatsSig.set(stats);
        console.log(`[EventStatsService] Stats loaded for event ${eventId}:`, stats);
      }),
      catchError(error => {
        console.error(`[EventStatsService] Error loading stats for event ${eventId}:`, error);
        this.notification.displayNotification('Erreur lors du chargement des statistiques de l\'événement', 'error');
        this.currentEventStatsSig.set(null);
        throw error;
      }),
      finalize(() => this.loadingStatsSig.set(false))
    );
  }

  /**
   * Charge les données temporelles d'un événement
   * @param eventId - ID de l'événement
   * @param timeframe - Période temporelle ('7d', '30d', '3m', etc.)
   * @param granularity - Granularité des données ('hour', 'day', 'week', 'month')
   * @returns Observable<EventTimeSeriesModel>
   */
  loadEventTimeSeries(eventId: number, timeframe: StatsTimeframe = '30d', granularity: 'day' | 'hour' | 'week' = 'day'): Observable<EventTimeSeriesModel> {
    const params: EventTimeSeriesRequestDto = {
      eventId,
      timeframe,
      granularity,
    };

    this.loadingStatsSig.set(true);

    return this.statsApi.getEventTimeSeries(eventId, params).pipe(
      tap(timeSeries => {
        this.currentEventTimeSeriesSig.set(timeSeries);
        console.log(`[EventStatsService] Time series loaded for event ${eventId}:`, timeSeries);
      }),
      catchError(error => {
        console.error(`[EventStatsService] Error loading time series for event ${eventId}:`, error);
        this.notification.displayNotification('Erreur lors du chargement des données temporelles', 'error');
        this.currentEventTimeSeriesSig.set(null);
        throw error;
      }),
      finalize(() => this.loadingStatsSig.set(false))
    );
  }

  /**
   * Charge les statistiques ET les données temporelles d'un événement
   * @param eventId - ID de l'événement
   * @param timeframe - Période temporelle
   * @param params - Paramètres optionnels
   * @returns Observable contenant les deux types de données
   */
  loadCompleteEventAnalytics(eventId: number, timeframe: StatsTimeframe = '30d', params?: Partial<EventStatsRequestDto>): Observable<{stats: EventStatsModel, timeSeries: EventTimeSeriesModel}> {
    this.loadingStatsSig.set(true);
    this.currentEventIdSig.set(eventId);

    const stats$ = this.statsApi.getEventStats(eventId, params);
    const timeSeries$ = this.statsApi.getEventTimeSeries(eventId, {
      eventId,
      timeframe,
      granularity: 'day'
    });

    return combineLatest([stats$, timeSeries$]).pipe(
      map(([stats, timeSeries]) => ({ stats, timeSeries })),
      tap(({ stats, timeSeries }) => {
        this.currentEventStatsSig.set(stats);
        this.currentEventTimeSeriesSig.set(timeSeries);
        console.log(`[EventStatsService] Complete analytics loaded for event ${eventId}`);
      }),
      catchError(error => {
        console.error(`[EventStatsService] Error loading complete analytics for event ${eventId}:`, error);
        this.notification.displayNotification('Erreur lors du chargement des analyses complètes', 'error');
        this.currentEventStatsSig.set(null);
        this.currentEventTimeSeriesSig.set(null);
        throw error;
      }),
      finalize(() => this.loadingStatsSig.set(false))
    );
  }

  /**
   * Compare les statistiques de plusieurs événements
   * @param eventIds - Liste des IDs d'événements à comparer
   * @param timeframe - Période de comparaison
   * @returns Observable des données de comparaison
   */
  compareEvents(eventIds: number[], timeframe: StatsTimeframe = '30d'): Observable<any> {
    if (eventIds.length < 2) {
      this.notification.displayNotification('Au moins 2 événements sont nécessaires pour une comparaison', 'warning');
      return of(null);
    }

    if (eventIds.length > 5) {
      this.notification.displayNotification('Maximum 5 événements peuvent être comparés à la fois', 'warning');
      eventIds = eventIds.slice(0, 5);
    }

    this.loadingStatsSig.set(true);

    return this.statsApi.compareEventStats(eventIds, timeframe).pipe(
      tap(comparisonData => {
        this.comparisonDataSubject.next(comparisonData);
        console.log(`[EventStatsService] Comparison loaded for events:`, eventIds);
      }),
      catchError(error => {
        console.error(`[EventStatsService] Error comparing events:`, error);
        this.notification.displayNotification('Erreur lors de la comparaison des événements', 'error');
        throw error;
      }),
      finalize(() => this.loadingStatsSig.set(false))
    );
  }

  /**
   * Rafraîchit les données de l'événement actuellement sélectionné
   */
  refreshCurrentEventStats(): Observable<EventStatsModel | null> {
    const currentEventId = this.currentEventIdSig();
    if (!currentEventId) {
      return of(null);
    }

    return this.loadEventStats(currentEventId, undefined, true);
  }

  /**
   * Nettoie le cache et reset l'état
   */
  clearCache(): void {
    this.currentEventStatsSig.set(null);
    this.currentEventTimeSeriesSig.set(null);
    this.currentEventIdSig.set(null);
    this.comparisonDataSubject.next(null);
    console.log('[EventStatsService] Cache cleared');
  }

  /**
   * Sélectionne un événement pour le suivi des statistiques
   * @param eventId - ID de l'événement à suivre
   */
  selectEvent(eventId: number): void {
    if (this.currentEventIdSig() !== eventId) {
      this.currentEventIdSig.set(eventId);
      // Optionnel : charger automatiquement les stats de base
      this.loadEventStats(eventId).subscribe();
    }
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Formate les métriques de performance pour l'affichage
   * @param stats - Données statistiques
   * @returns Métriques formatées
   */
  getFormattedPerformanceMetrics(stats: EventStatsModel | null): any {
    if (!stats) return null;

    return {
      fillRate: {
        value: stats.fillRate,
        formatted: `${stats.fillRate}%`,
        status: this.getFillRateStatus(stats.fillRate)
      },
      attendance: {
        value: stats.ticketsAttributed,
        formatted: `${stats.ticketsAttributed} / ${stats.totalCapacity}`,
        percentage: stats.fillRate
      },
      reservations: {
        total: stats.uniqueReservations,
        average: stats.avgTicketsPerReservation,
        formatted: `${stats.uniqueReservations} réservations (${stats.avgTicketsPerReservation} billets/rés.)`
      },
      scanning: {
        scanned: stats.ticketsScanned,
        scanRate: stats.scanRate,
        noShowRate: stats.noShowRate,
        formatted: `${stats.ticketsScanned} scannés (${stats.scanRate}%)`
      }
    };
  }

  /**
   * Détermine le statut du taux de remplissage
   */
  private getFillRateStatus(fillRate: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (fillRate >= 90) return 'excellent';
    if (fillRate >= 70) return 'good';
    if (fillRate >= 50) return 'average';
    return 'poor';
  }

  /**
   * Calcule les tendances pour les graphiques
   * @param timeSeries - Données temporelles
   * @returns Données formatées pour les graphiques
   */
  getChartData(timeSeries: EventTimeSeriesModel | null): any {
    if (!timeSeries || !timeSeries.dataPoints?.length) return null;

    return {
      labels: timeSeries.dataPoints.map(point => point.timestamp),
      datasets: [
        {
          label: 'Taux de remplissage (%)',
          data: timeSeries.dataPoints.map(point => point.fillRate),
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F630',
          tension: 0.4
        },
        {
          label: 'Billets attribués',
          data: timeSeries.dataPoints.map(point => point.ticketsAttributed),
          borderColor: '#10B981',
          backgroundColor: '#10B98130',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  }

  /**
   * Retourne les KPIs principaux formatés
   * @param stats - Statistiques de l'événement
   * @returns KPIs formatés pour l'affichage dashboard
   */
  getMainKPIs(stats: EventStatsModel | null): any[] {
    if (!stats) return [];

    return [
      {
        label: 'Taux de remplissage',
        value: stats.fillRate,
        unit: '%',
        trend: stats.fillRateComparison,
        icon: 'users',
        color: this.getFillRateColor(stats.fillRate)
      },
      {
        label: 'Billets vendus',
        value: stats.ticketsAttributed,
        unit: '',
        trend: stats.ticketsAttributedComparison,
        icon: 'ticket',
        color: 'blue'
      },
      {
        label: 'Taux de scan',
        value: stats.scanRate,
        unit: '%',
        trend: null,
        icon: 'qr-code',
        color: 'green'
      },
      {
        label: 'No-show',
        value: stats.noShowRate,
        unit: '%',
        trend: null,
        icon: 'user-x',
        color: 'red'
      }
    ];
  }

  private getFillRateColor(fillRate: number): string {
    if (fillRate >= 90) return 'green';
    if (fillRate >= 70) return 'blue';
    if (fillRate >= 50) return 'yellow';
    return 'red';
  }
}
