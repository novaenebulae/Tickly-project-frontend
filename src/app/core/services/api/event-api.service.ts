// src/app/core/services/api/event-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from './api-config.service';
import { APP_CONFIG } from '../../config/app-config';
import { EventStatus } from '../../models/event.model';
import { Event, EventCategory } from '../../models/event.model';
import { EventCategoryModel } from '../../models/event/event-category.model';

import { mockEvents } from '../../mocks/events/events.mock';
import { mockCategories } from '../../mocks/events/categories.mock';
import { EventSearchParams } from '../../models/event/event-search-params.model';

/**
 * Service API pour les événements
 * Gère les requêtes HTTP liées aux événements et délègue à des mocks si nécessaire
 */
@Injectable({
  providedIn: 'root'
})
export class EventApiService {
  private apiConfig = inject(ApiConfigService);

  /**
   * Récupère tous les événements avec possibilité de filtrage
   * @param params Paramètres de recherche et filtrage
   */
  getEvents(params: EventSearchParams = {}): Observable<Event[]> {
    this.apiConfig.logApiRequest('GET', 'events', params);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockGetEvents(params);
    }

    // Préparation des paramètres HTTP
    const httpParams = this.convertToHttpParams(params);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<Event[]>(url, { headers, params: httpParams }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'events', response)),
      catchError(error => this.handleEventError(error, 'getEvents'))
    );
  }

  /**
   * Recherche des événements avec un terme de recherche
   * @param params Paramètres de recherche incluant le terme de recherche
   */
  searchEvents(params: EventSearchParams): Observable<Event[]> {
    this.apiConfig.logApiRequest('GET', 'search-events', params);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockSearchEvents(params);
    }

    // Préparation des paramètres HTTP
    const httpParams = this.convertToHttpParams(params);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.search);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<Event[]>(url, { headers, params: httpParams }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'search-events', response)),
      catchError(error => this.handleEventError(error, 'searchEvents'))
    );
  }

  /**
   * Récupère un événement par son ID
   * @param id ID de l'événement à récupérer
   */
  getEventById(id: number): Observable<Event> {
    this.apiConfig.logApiRequest('GET', `event/${id}`, null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockGetEventById(id);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<Event>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', `event/${id}`, response)),
      catchError(error => this.handleEventError(error, 'getEventById'))
    );
  }

  /**
   * Crée un nouvel événement
   * @param event Données de l'événement à créer
   */
  createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Observable<Event> {
    this.apiConfig.logApiRequest('POST', 'create-event', event);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockCreateEvent(event);
    }

    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.post<Event>(url, event, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'create-event', response)),
      catchError(error => this.handleEventError(error, 'createEvent'))
    );
  }

  /**
   * Met à jour un événement existant
   * @param id ID de l'événement à mettre à jour
   * @param event Données mises à jour de l'événement
   */
  updateEvent(id: number, event: Partial<Event>): Observable<Event> {
    this.apiConfig.logApiRequest('PUT', `update-event/${id}`, event);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockUpdateEvent(id, event);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.put<Event>(url, event, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', `update-event/${id}`, response)),
      catchError(error => this.handleEventError(error, 'updateEvent'))
    );
  }

  /**
   * Supprime un événement
   * @param id ID de l'événement à supprimer
   */
  deleteEvent(id: number): Observable<void> {
    this.apiConfig.logApiRequest('DELETE', `delete-event/${id}`, null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockDeleteEvent(id);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', `delete-event/${id}`, 'Suppression réussie')),
      catchError(error => this.handleEventError(error, 'deleteEvent'))
    );
  }

  /**
   * Récupère les catégories d'événements disponibles
   */
  getEventCategories(): Observable<{id: number, name: EventCategory}[]> {
    this.apiConfig.logApiRequest('GET', 'event-categories', null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockGetEventCategories();
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/categories`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<{id: number, name: EventCategory}[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'event-categories', response)),
      catchError(error => this.handleEventError(error, 'getEventCategories'))
    );
  }

  /**
   * Change le statut d'un événement
   * @param id ID de l'événement
   * @param status Nouveau statut
   */
  updateEventStatus(id: number, status: EventStatus): Observable<Event> {
    this.apiConfig.logApiRequest('PATCH', `update-event-status/${id}`, { status });

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockUpdateEventStatus(id, status);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}/status`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.patch<Event>(url, { status }, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PATCH', `update-event-status/${id}`, response)),
      catchError(error => this.handleEventError(error, 'updateEventStatus'))
    );
  }

  /**
   * Convertit les paramètres de recherche en HttpParams
   */
  private convertToHttpParams(params: EventSearchParams): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          httpParams = httpParams.set(key, value.toISOString());
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });

    return httpParams;
  }

  /**
   * Gère les erreurs des appels API d'événements
   */
  private handleEventError(
    error: HttpErrorResponse,
    context: string
  ): Observable<never> {
    this.apiConfig.logApiError('EVENT-API', context, error);

    let userMessage: string;

    if (error.status === 404) {
      userMessage = 'Événement non trouvé.';
    } else if (error.status === 403) {
      userMessage = 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.';
    } else if (error.status === 400) {
      userMessage = 'Données invalides. Veuillez vérifier votre saisie.';
    } else {
      userMessage = 'Une erreur est survenue lors de la communication avec le serveur.';
    }

    return throwError(() => ({
      status: error.status,
      message: userMessage,
      original: error
    }));
  }

  // ===== Méthodes de mock pour les tests et le développement =====

  private mockGetEvents(params: EventSearchParams): Observable<Event[]> {
    let filteredEvents = [...mockEvents];

    // Application des filtres
    if (params.category !== undefined) {
      // Si category est un objet avec une propriété id (EventCategoryModel)
      if (typeof params.category === 'object' && params.category !== null) {
        const categoryId = (params.category as EventCategoryModel).id;
        const categoryObj = mockCategories.find(cat => cat.id === categoryId);
        if (categoryObj) {
          filteredEvents = filteredEvents.filter(e => e.category === categoryObj.name);
        }
      }
      // Si category est un nombre (ID)
      else if (typeof params.category === 'number') {
        const categoryObj = mockCategories.find(cat => cat.id === params.category);
        if (categoryObj) {
          filteredEvents = filteredEvents.filter(e => e.category === categoryObj.name);
        }
      }
    }

    // Reste des filtres
    if (params.startDate) {
      filteredEvents = filteredEvents.filter(e => new Date(e.startDate) >= new Date(params.startDate!));
    }

    if (params.endDate) {
      filteredEvents = filteredEvents.filter(e => new Date(e.endDate) <= new Date(params.endDate!));
    }

    if (params.free !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.isFreeEvent === params.free);
    }

    if (params.status) {
      filteredEvents = filteredEvents.filter(e => e.status === params.status);
    }

    if (params.structureId) {
      filteredEvents = filteredEvents.filter(e => e.createdByStructureId === params.structureId);
    }

    if (params.featured !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.isFeaturedEvent === params.featured);
    }

    // Tri
    if (params.sortBy) {
      const direction = params.sortDirection === 'desc' ? -1 : 1;
      filteredEvents.sort((a, b) => {
        const valA = a[params.sortBy as keyof Event];
        const valB = b[params.sortBy as keyof Event];

        // Gestion des valeurs undefined ou null
        if (valA === undefined || valA === null) return 1 * direction;
        if (valB === undefined || valB === null) return -1 * direction;

        // Comparaison pour les dates
        if (valA instanceof Date && valB instanceof Date) {
          return (valA.getTime() - valB.getTime()) * direction;
        }

        // Comparaison standard avec vérification de type
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * direction;
        }

        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
        return 0;
      });
    }

    // Pagination
    if (params.page !== undefined && params.pageSize) {
      const start = params.page * params.pageSize;
      const end = start + params.pageSize;
      filteredEvents = filteredEvents.slice(start, end);
    }

    return this.apiConfig.createMockResponse(filteredEvents);
  }

  /**
   * Version mock de la recherche d'événements
   */
  private mockSearchEvents(params: EventSearchParams): Observable<Event[]> {
    let filteredEvents = [...mockEvents];

    // Recherche textuelle
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredEvents = filteredEvents.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.shortDescription?.toLowerCase().includes(query) ||
        e.fullDescription.toLowerCase().includes(query)
      );
    }

    // Appliquer les autres filtres
    return this.mockGetEvents({...params, query: undefined});
  }

  /**
   * Version mock de la récupération d'un événement par ID
   */
  private mockGetEventById(id: number): Observable<Event> {
    const event = mockEvents.find(e => e.id === id);

    if (!event) {
      return this.apiConfig.createMockError(404, 'Événement non trouvé');
    }

    return this.apiConfig.createMockResponse(event);
  }

  /**
   * Version mock de la création d'un événement
   */
  private mockCreateEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Observable<Event> {
    // Validation simplifiée
    if (!event.name || !event.category || !event.startDate || !event.endDate) {
      return this.apiConfig.createMockError(400, 'Les champs obligatoires sont manquants');
    }

    // Création d'un nouvel ID
    const newId = Math.max(...mockEvents.map(e => e.id || 0)) + 1;

    const newEvent: Event = {
      ...event,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: event.status || 'draft' // Par défaut en brouillon
    };

    // Dans un vrai mock, on pourrait ajouter à la liste des événements
    // mockEvents.push(newEvent);

    return this.apiConfig.createMockResponse(newEvent);
  }

  /**
   * Version mock de la mise à jour d'un événement
   */
  private mockUpdateEvent(id: number, eventData: Partial<Event>): Observable<Event> {
    const index = mockEvents.findIndex(e => e.id === id);

    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Événement non trouvé');
    }

    // Mise à jour fictive
    const updatedEvent: Event = {
      ...mockEvents[index],
      ...eventData,
      updatedAt: new Date()
    };

    // Dans un vrai mock, on mettrait à jour la liste
    // mockEvents[index] = updatedEvent;

    return this.apiConfig.createMockResponse(updatedEvent);
  }

  /**
   * Version mock de la suppression d'un événement
   */
  private mockDeleteEvent(id: number): Observable<void> {
    const index = mockEvents.findIndex(e => e.id === id);

    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Événement non trouvé');
    }

    // Dans un vrai mock, on supprimerait de la liste
    // mockEvents.splice(index, 1);

    return this.apiConfig.createMockResponse<void>(undefined);
  }

  /**
   * Version mock de la récupération des catégories d'événements
   */
  private mockGetEventCategories(): Observable<{id: number, name: EventCategory}[]> {
    return this.apiConfig.createMockResponse(mockCategories);
  }

  /**
   * Version mock de la mise à jour du statut d'un événement
   */
  private mockUpdateEventStatus(id: number, status: EventStatus): Observable<Event> {
    const index = mockEvents.findIndex(e => e.id === id);

    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Événement non trouvé');
    }

    // Mise à jour fictive
    const updatedEvent: Event = {
      ...mockEvents[index],
      status,
      updatedAt: new Date()
    };

    // Dans un vrai mock, on mettrait à jour la liste
    // mockEvents[index] = updatedEvent;

    return this.apiConfig.createMockResponse(updatedEvent);
  }

  /**
   * Récupère les événements à afficher sur la page d'accueil
   */
  getHomePageEvents(count: number = APP_CONFIG.events.defaultHomeCount): Observable<Event[]> {
    // Soit on utilise une requête spécifique, soit on filtre les événements
    const params: EventSearchParams = {
      // Utiliser un filtre existant pour les événements à afficher sur la page d'accueil
      query: "homepage", // On peut utiliser le champ de recherche textuelle pour filtrer
      status: 'published',
      sortBy: 'startDate',
      sortDirection: 'asc',
      pageSize: count,
      page: 0
    };

    return this.getEvents(params);
  }

  /**
   * Récupère les événements mis en avant
   */
  getFeaturedEvents(count: number = 3): Observable<Event[]> {
    const params: EventSearchParams = {
      featured: true,
      status: 'published',
      sortBy: 'startDate',
      sortDirection: 'asc',
      pageSize: count,
      page: 0
    };

    return this.getEvents(params);
  }

  /**
   * Récupère les événements à venir (après aujourd'hui)
   */
  getUpcomingEvents(params: EventSearchParams = {}): Observable<Event[]> {
    return this.getEvents({
      ...params,
      startDate: new Date(),
      status: 'published',
      sortBy: 'startDate',
      sortDirection: 'asc'
    });
  }

  /**
   * Récupère les événements créés par une structure spécifique
   */
  getEventsByStructure(structureId: number, params: EventSearchParams = {}): Observable<Event[]> {
    return this.getEvents({
      ...params,
      structureId
    });
  }
}
