/**
 * @file API service for event-related operations.
 * Handles HTTP requests for events and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import { EventApiMockService } from './event-api-mock.service';
import { APP_CONFIG } from '../../../config/app-config';
import {EventModel, EventStatus, EventSummaryModel} from '../../../models/event/event.model';
import { EventSearchParams } from '../../../models/event/event-search-params.model';

@Injectable({
  providedIn: 'root'
})
export class EventApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private mockService = inject(EventApiMockService); // Inject the mock service

  /**
   * Retrieves a list of events based on search parameters.
   * Returns raw API DTOs.
   * @param params - Search and filter parameters.
   */
  getEvents(params: EventSearchParams = {}): Observable<any[]> {

    this.apiConfig.logApiRequest('GET', 'events', params);
    const httpParams = this.convertToHttpParams(params);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any[]>(url, { headers, params: httpParams }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'events', response)),
      catchError(error => this.handleEventError(error, 'getEvents'))
    );
  }

  /**
   * Searches for events based on search parameters.
   * Returns raw API DTOs.
   * @param params - Search parameters including the search term.
   */
  searchEvents(params: EventSearchParams): Observable<any[]> {

    this.apiConfig.logApiRequest('GET', 'search-events', params);
    const httpParams = this.convertToHttpParams(params);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.search);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any[]>(url, { headers, params: httpParams }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'search-events', response)),
      catchError(error => this.handleEventError(error, 'searchEvents'))
    );
  }

  /**
   * Retrieves a single event by its ID.
   * Returns a raw API DTO.
   * @param id - The ID of the event to retrieve.
   */
  getEventById(id: number): Observable<any> {

    this.apiConfig.logApiRequest('GET', `event/${id}`);
    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', `event/${id}`, response)),
      catchError(error => this.handleEventError(error, 'getEventById'))
    );
  }

  /**
   * Creates a new event.
   * Expects a raw API DTO for the event.
   * @param eventApiDto - The raw API DTO representing the event to create.
   *                      Should contain `categoryId` and appropriate `audienceZones`.
   * @param forceRefresh - If true, the UI should refresh the event list after creation
   */
  createEvent(eventApiDto: any, forceRefresh: boolean = true): Observable<any> {
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockService.mockCreateEvent(eventApiDto);
    }

    this.apiConfig.logApiRequest('POST', 'create-event', eventApiDto);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<any>(url, eventApiDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'create-event', response)),
      catchError(error => this.handleEventError(error, 'createEvent'))
    );
  }

  /**
   * Updates an existing event.
   * Expects a partial raw API DTO with fields to update.
   * @param id - The ID of the event to update.
   * @param eventApiDto - The partial raw API DTO with updated data.
   * @param forceRefresh - If true, the UI should refresh the event list after update
   */
  updateEvent(id: number, eventApiDto: Partial<any>, forceRefresh: boolean = true): Observable<any> {
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockService.mockUpdateEvent(id, eventApiDto);
    }

    this.apiConfig.logApiRequest('PUT', `update-event/${id}`, eventApiDto);
    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();
    return this.http.put<any>(url, eventApiDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', `update-event/${id}`, response)),
      catchError(error => this.handleEventError(error, 'updateEvent'))
    );
  }

  /**
   * Deletes an event by its ID.
   * @param id - The ID of the event to delete.
   */
  deleteEvent(id: number): Observable<void> {
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockService.mockDeleteEvent(id);
    }

    this.apiConfig.logApiRequest('DELETE', `delete-event/${id}`);
    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', `delete-event/${id}`, 'Deletion successful')),
      catchError(error => this.handleEventError(error, 'deleteEvent'))
    );
  }

  /**
   * Retrieves available event categories.
   * Returns raw API category DTOs (e.g., array of {id: number, name: string}).
   */
  getEventCategories(): Observable<any[]> {

    this.apiConfig.logApiRequest('GET', 'event-categories');
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.categories); // Or a dedicated categories endpoint
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'event-categories', response)),
      catchError(error => this.handleEventError(error, 'getEventCategories'))
    );
  }

  /**
   * Updates the status of an event.
   * @param id - The ID of the event.
   * @param status - The new status to set.
   */
  updateEventStatus(id: number, status: EventStatus): Observable<any> {
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockService.mockUpdateEventStatus(id, status);
    }

    this.apiConfig.logApiRequest('PATCH', `update-event-status/${id}`, { status });
    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}/status`;
    const headers = this.apiConfig.createHeaders();
    return this.http.patch<any>(url, { status }, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PATCH', `update-event-status/${id}`, response)),
      catchError(error => this.handleEventError(error, 'updateEventStatus'))
    );
  }

  /**
   * Retrieves events to be displayed on the homepage.
   * @param count - The number of events to retrieve.
   */
  getHomePageEvents(count: number = APP_CONFIG.events.defaultHomeCount): Observable<any[]> {
    const params: EventSearchParams = {

    };
    return this.getEvents(params); // Delegates to the main getEvents method
  }

  /**
   * Retrieves featured events.
   * @param count - The number of featured events to retrieve.
   * @param structureId - If defined gets only featured events of this structure.
   */
  getFeaturedEvents(count: number = 3, structureId?: number): Observable<EventSummaryModel[]> {
    const params: EventSearchParams = {
      structureId: structureId,
      isFeatured: true, // Using the renamed model property
      status: EventStatus.PUBLISHED,
      sortBy: 'startDate',
      sortDirection: 'asc',
      pageSize: count,
      page: 0
    };
    return this.getEvents(params);
  }

  /**
   * Retrieves upcoming events (events starting from today).
   * @param params - Additional search parameters.
   */
  getUpcomingEvents(params: EventSearchParams = {}): Observable<any[]> {
    return this.getEvents({
      ...params,
      startDateAfter: params.startDateAfter || new Date(),
      status: EventStatus.PUBLISHED,
      sortBy: 'startDate',
      sortDirection: 'asc'
    });
  }

  /**
   * Retrieves events hosted by a specific structure.
   * @param structureId - The ID of the structure.
   * @param params - Additional search parameters.
   */
  getEventsByStructure(structureId: number, params: EventSearchParams = {}): Observable<any[]> {
    return this.getEvents({
      ...params,
      structureId
    });
  }

  /**
   * Converts EventSearchParams into HttpParams for API requests.
   * @param params - The search parameters.
   */
  private convertToHttpParams(params: EventSearchParams): HttpParams {
    let httpParams = new HttpParams();

    // Boucle sur tous les paramètres pour les ajouter à la requête
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key as keyof EventSearchParams];

        if (value === undefined || value === null || value === '') {
          continue; // Ignorer les valeurs vides ou nulles
        }


        if (key === 'categoryIds' && Array.isArray(value)) {
          // Gérer le tableau d'IDs
          value.forEach(id => {
            httpParams = httpParams.append('categoryIds', id.toString());
          });
        } else if (value instanceof Date) {
          httpParams = httpParams.set(key, value.toISOString());
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            httpParams = httpParams.append(key, item.toString());
          });
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    }

    if (params.sortBy && params.sortDirection) {
      const sortField = params.sortBy === 'date' ? 'startDate' : params.sortBy;
      const sortValue = `${sortField},${params.sortDirection}`;
      httpParams = httpParams.set('sort', sortValue);
    }

    return httpParams;
  }

  /**
   * Handles errors from event API calls.
   * @param error - The HttpErrorResponse.
   * @param context - A string describing the context of the error.
   */
  private handleEventError(error: HttpErrorResponse, context: string): Observable<never> {
    this.apiConfig.logApiError('EVENT-API', context, error);
    // Default user message, can be overridden by specific status codes
    let userMessage = 'Une erreur est survenue lors de la communication avec le serveur pour les événements.';

    if (error.status === 404) {
      userMessage = 'Événement non trouvé.';
    } else if (error.status === 403) {
      userMessage = 'Vous n\'avez pas les droits nécessaires pour cette action sur l\'événement.';
    } else if (error.status === 400) {
      userMessage = 'Les données fournies pour l\'événement sont invalides.';
    }
    // You can add more specific error messages based on error.error.message from backend if available

    return throwError(() => ({
      status: error.status,
      message: userMessage, // User-friendly message
      originalError: error // The original HttpErrorResponse for further debugging
    }));
  }
}
