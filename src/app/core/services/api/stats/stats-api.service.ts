import {ApiConfigService} from '../api-config.service';
import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EventStatsApiMockService} from './event/event-stats-api-mock.service';
import {StructureStatsApiMockService} from './structure/structure-stats-api-mock.service';
import {
  EventStatsRequestDto,
  EventTimeSeriesRequestDto
} from '../../../models/stats/dtos/event-stats-request-dto.model';
import {Observable} from 'rxjs';
import {EventStatsModel, EventTimeSeriesModel} from '../../../models/stats/dependances/event-stats-model.model';
import {catchError, tap} from 'rxjs/operators';
import {
  EventsOverviewStatsRequestDto,
  StructureStatsRequestDto
} from '../../../models/stats/dtos/structure-stats-request-dto.model';
import {StructureStatsModel} from '../../../models/stats/structure/structure-global-stats.model';
import {EventsOverviewStatsModel} from '../../../models/stats/dependances/event-performance-snapshot.model';
import { APP_CONFIG } from '../../../config/app-config';
import {StatsTimeframe} from '../../../models/stats/dependances/stats-timeframe.model';

@Injectable({
  providedIn: 'root'
})
export class StatsApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(HttpClient);
  private eventStatsMockService = inject(EventStatsApiMockService);
  private structureStatsMockService = inject(StructureStatsApiMockService);

  // ===== ÉVÉNEMENTS STATS =====

  /**
   * Récupère les statistiques d'un événement
   */
  getEventStats(eventId: number, params?: Partial<EventStatsRequestDto>): Observable<EventStatsModel> {
    const endpoint = APP_CONFIG.api.endpoints.stats.events.base(eventId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.eventStatsMockService.mockGetEventStats(eventId, params);
    }

    this.apiConfig.logApiRequest('GET', endpoint, params);
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<EventStatsModel>(url, {
      headers,
      params: this.buildHttpParams(params)
    }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpoint, response)),
      catchError(error => this.handleStatsError(error, 'getEventStats'))
    );
  }

  /**
   * Récupère les données temporelles d'un événement
   */
  getEventTimeSeries(eventId: number, params: EventTimeSeriesRequestDto): Observable<EventTimeSeriesModel> {
    const endpoint = APP_CONFIG.api.endpoints.stats.events.timeSeries(eventId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.eventStatsMockService.mockGetEventTimeSeries(eventId, params);
    }

    this.apiConfig.logApiRequest('GET', endpoint, params);
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<EventTimeSeriesModel>(url, {
      headers,
      params: this.buildHttpParams(params)
    }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpoint, response)),
      catchError(error => this.handleStatsError(error, 'getEventTimeSeries'))
    );
  }

  /**
   * Compare les statistiques de plusieurs événements
   */
  compareEventStats(eventIds: number[], timeframe: StatsTimeframe): Observable<any> {
    const endpoint = APP_CONFIG.api.endpoints.stats.events.compare;

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.eventStatsMockService.mockCompareEventStats(eventIds, timeframe);
    }

    this.apiConfig.logApiRequest('GET', endpoint, { eventIds, timeframe });
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<any>(url, {
      headers,
      params: {
        eventIds: eventIds.join(','),
        timeframe
      }
    }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpoint, response)),
      catchError(error => this.handleStatsError(error, 'compareEventStats'))
    );
  }

  /**
   * Récupère les métriques de performance d'un événement
   */
  getEventPerformance(eventId: number, params?: any): Observable<any> {
    const endpoint = APP_CONFIG.api.endpoints.stats.events.performance(eventId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.eventStatsMockService.mockGetEventStats(eventId, params);
    }

    this.apiConfig.logApiRequest('GET', endpoint, params);
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<any>(url, {
      headers,
      params: this.buildHttpParams(params)
    }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpoint, response)),
      catchError(error => this.handleStatsError(error, 'getEventPerformance'))
    );
  }

  // ===== STRUCTURES STATS =====

  /**
   * Récupère les statistiques complètes d'une structure
   */
  getStructureStats(structureId: number, params?: Partial<StructureStatsRequestDto>): Observable<StructureStatsModel> {
    const endpoint = APP_CONFIG.api.endpoints.stats.structures.base(structureId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.structureStatsMockService.mockGetStructureStats(structureId, params);
    }

    this.apiConfig.logApiRequest('GET', endpoint, params);
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<StructureStatsModel>(url, {
      headers,
      params: this.buildHttpParams(params)
    }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpoint, response)),
      catchError(error => this.handleStatsError(error, 'getStructureStats'))
    );
  }

  /**
   * Récupère l'overview des événements d'une structure
   */
  getEventsOverviewStats(structureId: number, params?: EventsOverviewStatsRequestDto): Observable<EventsOverviewStatsModel> {
    const endpoint = APP_CONFIG.api.endpoints.stats.structures.eventsOverview(structureId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.structureStatsMockService.mockGetEventsOverviewStats(structureId, params);
    }

    this.apiConfig.logApiRequest('GET', endpoint, params);
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<EventsOverviewStatsModel>(url, {
      headers,
      params: this.buildHttpParams(params)
    }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpoint, response)),
      catchError(error => this.handleStatsError(error, 'getEventsOverviewStats'))
    );
  }

  /**
   * Récupère le dashboard consolidé d'une structure
   */
  getStructureDashboard(structureId: number): Observable<any> {
    const endpoint = APP_CONFIG.api.endpoints.stats.structures.dashboard(structureId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.structureStatsMockService.mockGetStructureDashboard(structureId);
    }

    this.apiConfig.logApiRequest('GET', endpoint, null);
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<any>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpoint, response)),
      catchError(error => this.handleStatsError(error, 'getStructureDashboard'))
    );
  }

  /**
   * Récupère les analytics avancées d'une structure
   */
  getStructureAnalytics(structureId: number, params?: any): Observable<any> {
    const endpoint = APP_CONFIG.api.endpoints.stats.structures.analytics(structureId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.structureStatsMockService.mockGetStructureStats(structureId, params);
    }

    this.apiConfig.logApiRequest('GET', endpoint, params);
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<any>(url, {
      headers,
      params: this.buildHttpParams(params)
    }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpoint, response)),
      catchError(error => this.handleStatsError(error, 'getStructureAnalytics'))
    );
  }

  // ===== EXPORTS =====

  /**
   * Génère un rapport d'événement
   */
  exportEventReport(eventId: number, format: 'pdf' | 'excel' | 'csv' = 'pdf', params?: any): Observable<Blob> {
    const endpoint = APP_CONFIG.api.endpoints.stats.exports.eventReport(eventId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      // Pour les mocks, retourner un blob vide
      return this.apiConfig.createMockResponse(new Blob(['Mock report data'], { type: 'application/pdf' }));
    }

    this.apiConfig.logApiRequest('GET', endpoint, { format, ...params });
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get(url, {
      headers,
      params: { format, ...this.buildHttpParams(params) },
      responseType: 'blob'
    }).pipe(
      tap(() => this.apiConfig.logApiResponse('GET', endpoint, 'Blob response')),
      catchError(error => this.handleStatsError(error, 'exportEventReport'))
    );
  }

  /**
   * Génère un rapport de structure
   */
  exportStructureReport(structureId: number, format: 'pdf' | 'excel' | 'csv' = 'pdf', params?: any): Observable<Blob> {
    const endpoint = APP_CONFIG.api.endpoints.stats.exports.structureReport(structureId);

    if (this.apiConfig.isMockEnabledForDomain('stats')) {
      return this.apiConfig.createMockResponse(new Blob(['Mock structure report'], { type: 'application/pdf' }));
    }

    this.apiConfig.logApiRequest('GET', endpoint, { format, ...params });
    const url = this.apiConfig.getUrl(endpoint);
    const headers = this.apiConfig.createHeaders();

    return this.http.get(url, {
      headers,
      params: { format, ...this.buildHttpParams(params) },
      responseType: 'blob'
    }).pipe(
      tap(() => this.apiConfig.logApiResponse('GET', endpoint, 'Blob response')),
      catchError(error => this.handleStatsError(error, 'exportStructureReport'))
    );
  }

  // ===== MÉTHODES PRIVÉES =====

  /**
   * Construit les paramètres HTTP à partir d'un objet
   */
  private buildHttpParams(params: any): any {
    if (!params) return undefined;

    const httpParams: any = {};
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          httpParams[key] = value.toISOString();
        } else if (Array.isArray(value)) {
          httpParams[key] = value.join(',');
        } else {
          httpParams[key] = value.toString();
        }
      }
    });

    return httpParams;
  }

  /**
   * Gestion des erreurs spécifiques aux statistiques
   */
  private handleStatsError(error: any, operation: string): Observable<never> {
    console.error(`[StatsApiService] Error in ${operation}:`, error);

    // Log spécifique selon le type d'erreur
    if (error.status === 404) {
      console.warn(`[StatsApiService] Resource not found in ${operation}`);
    } else if (error.status === 403) {
      console.warn(`[StatsApiService] Access denied in ${operation}`);
    } else if (error.status >= 500) {
      console.error(`[StatsApiService] Server error in ${operation}`);
    }

    throw error; // Re-throw pour laisser le service domain gérer
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Vérifie si le module stats est activé
   */
  get isStatsModuleEnabled(): boolean {
    return APP_CONFIG.features.enableStatsModule;
  }

  /**
   * Vérifie si les exports sont activés
   */
  get isExportsEnabled(): boolean {
    return APP_CONFIG.features.enableStatsExports;
  }

  /**
   * Récupère la configuration des graphiques
   */
  get chartsConfig() {
    return APP_CONFIG.stats.charts;
  }

  /**
   * Récupère les seuils configurés
   */
  get thresholds() {
    return APP_CONFIG.stats.thresholds;
  }
}
