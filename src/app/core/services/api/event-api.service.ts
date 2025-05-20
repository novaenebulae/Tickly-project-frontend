// src/app/core/services/api/event-api.service.ts

import {Injectable, inject} from '@angular/core';
import {HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

import {ApiConfigService} from './api-config.service';
import {APP_CONFIG} from '../../config/app-config';
import {EventModel, EventStatus, EventCreationDto} from '../../models/event/event.model';
import {EventCategoryModel} from '../../models/event/event-category.model';
import {EventSearchParams} from '../../models/event/event-search-params.model';

import {
  allMockEvents,
  getMockEventById,
  getFilteredEvents,
  buildMockEvent,
  getNextEventId
} from '../../mocks/events/events.mock';
import {mockCategories} from '../../mocks/events/categories.mock';

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
  getEvents(params: EventSearchParams = {}): Observable<EventModel[]> {
    this.apiConfig.logApiRequest('GET', 'events', params);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockGetEvents(params);
    }

    // Préparation des paramètres HTTP
    const httpParams = this.convertToHttpParams(params);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<EventModel[]>(url, {headers, params: httpParams}).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'events', response)),
      catchError(error => this.handleEventError(error, 'getEvents'))
    );
  }

  /**
   * Recherche des événements avec un terme de recherche
   * @param params Paramètres de recherche incluant le terme de recherche
   */
  searchEvents(params: EventSearchParams): Observable<EventModel[]> {
    this.apiConfig.logApiRequest('GET', 'search-events', params);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockSearchEvents(params);
    }

    // Préparation des paramètres HTTP
    const httpParams = this.convertToHttpParams(params);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.search);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<EventModel[]>(url, {headers, params: httpParams}).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'search-events', response)),
      catchError(error => this.handleEventError(error, 'searchEvents'))
    );
  }

  /**
   * Récupère un événement par son ID
   * @param id ID de l'événement à récupérer
   */
  getEventById(id: number): Observable<EventModel> {
    this.apiConfig.logApiRequest('GET', `event/${id}`, null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockGetEventById(id);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<EventModel>(url, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', `event/${id}`, response)),
      catchError(error => this.handleEventError(error, 'getEventById'))
    );
  }

  /**
   * Crée un nouvel événement
   * @param event Données de l'événement à créer
   */
  createEvent(event: EventCreationDto): Observable<EventModel> {
    this.apiConfig.logApiRequest('POST', 'create-event', event);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockCreateEvent(event);
    }

    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.post<EventModel>(url, event, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'create-event', response)),
      catchError(error => this.handleEventError(error, 'createEvent'))
    );
  }

  /**
   * Met à jour un événement existant
   * @param id ID de l'événement à mettre à jour
   * @param event Données mises à jour de l'événement
   */
  updateEvent(id: number, event: Partial<EventModel>): Observable<EventModel> {
    this.apiConfig.logApiRequest('PUT', `update-event/${id}`, event);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockUpdateEvent(id, event);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.put<EventModel>(url, event, {headers}).pipe(
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

    return this.apiConfig.http.delete<void>(url, {headers}).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', `delete-event/${id}`, 'Suppression réussie')),
      catchError(error => this.handleEventError(error, 'deleteEvent'))
    );
  }

  /**
   * Récupère les catégories d'événements disponibles
   */
  getEventCategories(): Observable<EventCategoryModel[]> {
    this.apiConfig.logApiRequest('GET', 'event-categories', null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockGetEventCategories();
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/categories`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<EventCategoryModel[]>(url, {headers}).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'event-categories', response)),
      catchError(error => this.handleEventError(error, 'getEventCategories'))
    );
  }

  /**
   * Change le statut d'un événement
   * @param id ID de l'événement
   * @param status Nouveau statut
   */
  updateEventStatus(id: number, status: EventStatus): Observable<EventModel> {
    this.apiConfig.logApiRequest('PATCH', `update-event-status/${id}`, {status});

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('events')) {
      return this.mockUpdateEventStatus(id, status);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.events.base)}/${id}/status`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.patch<EventModel>(url, {status}, {headers}).pipe(
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

  /**
   * Version mock de la récupération d'événements
   */
  private mockGetEvents(params: EventSearchParams): Observable<EventModel[]> {
    console.log('Paramètres reçus dans mockGetEvents:', params);

    // Utiliser la fonction getFilteredEvents du mock
    const filters: any = {
      query: params.query,
      status: params.status,
      featured: params.featured,
      free: params.free,
      structureId: params.structureId
    };

    // Gestion du tri
    if (params.sortBy) {
      filters.sortBy = params.sortBy;
      filters.sortDirection = params.sortDirection || 'asc';
    }

    // Gestion de la catégorie
    if (params.category) {
      // Si c'est un tableau, passer directement le tableau
      if (Array.isArray(params.category)) {
        filters.category = params.category;
      }
      // Si c'est un objet EventCategoryModel
      else if (typeof params.category === 'object' && 'id' in params.category) {
        filters.category = params.category.id;
      }
      // Si c'est une chaîne, c'est un nom de catégorie
      else if (typeof params.category === 'string') {
        filters.categoryName = params.category;
      }
      // Sinon, c'est un ID
      else {
        filters.category = params.category;
      }
    }

    // Dates
    if (params.startDate) {
      filters.startDateFrom = new Date(params.startDate);
    }
    if (params.endDate) {
      filters.endDateTo = new Date(params.endDate);
    }

    // Localisation
    if (params.location) {
      filters.location = params.location;
    }


    const page = params.page || 0;
    const pageSize = params.pageSize || 10;

    // Filtrer les événements en fonction des critères
    return of(getFilteredEvents(allMockEvents, filters))
      .pipe(
        map(events => {
          console.log(`${events.length} événements trouvés après filtrage`);
          // Pagination
          const startIndex = page * pageSize;
          const endIndex = startIndex + pageSize;
          return events.slice(startIndex, endIndex);
        })
      );
  }

  /**
   * Version mock de la recherche d'événements
   */
  private mockSearchEvents(params: EventSearchParams): Observable<EventModel[]> {
    // Utiliser la même méthode que pour les événements filtrés
    return this.mockGetEvents(params);
  }

  /**
   * Version mock de la récupération d'un événement par ID
   */
  private mockGetEventById(id: number): Observable<EventModel> {
    const event = getMockEventById(id);

    if (!event) {
      return this.apiConfig.createMockError(404, 'Événement non trouvé');
    }

    return this.apiConfig.createMockResponse(event);
  }

// Correction pour src/app/core/services/api/event-api.service.ts

  /**
   * Version mock de la création d'un événement
   */
  private mockCreateEvent(eventData: EventCreationDto): Observable<EventModel> {
    // Validation de base
    if (!eventData.name || !eventData.fullDescription || !eventData.startDate || !eventData.endDate) {
      return this.apiConfig.createMockError(400, 'Informations manquantes pour créer l\'événement');
    }

    // Création d'un nouvel événement
    const newId = getNextEventId();

    // Trouver la catégorie
    const category = mockCategories.find(cat => cat.id === eventData.categoryId);
    if (!category) {
      return this.apiConfig.createMockError(400, 'Catégorie invalide');
    }

    // Créer un nouvel événement
    const newEvent: EventModel = {
      id: newId,
      name: eventData.name,
      // Correction ici : utiliser l'objet category complet au lieu de juste son ID
      category: category,
      shortDescription: eventData.shortDescription,
      fullDescription: eventData.fullDescription,
      tags: eventData.tags,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      address: eventData.address,
      structureId: eventData.structureId,
      isFreeEvent: eventData.isFreeEvent,
      defaultSeatingType: eventData.defaultSeatingType,
      seatingZones: eventData.seatingZones.map((zone, index) => ({
        ...zone,
        id: newId * 100 + index // Générer des IDs fictifs pour les zones
      })),
      displayOnHomepage: eventData.displayOnHomepage || false,
      isFeaturedEvent: eventData.isFeaturedEvent || false,
      links: eventData.links,
      mainPhotoUrl: eventData.mainPhotoUrl,
      eventPhotoUrls: eventData.eventPhotoUrls,
      status: 'draft', // Nouveau événement est un brouillon par défaut
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Dans un vrai environnement, on ajouterait à la liste des events
    // allMockEvents.push(newEvent);

    return this.apiConfig.createMockResponse(newEvent);
  }

  /**
   * Version mock de la mise à jour d'un événement
   */
  private mockUpdateEvent(id: number, eventData: Partial<EventModel>): Observable<EventModel> {
    const existingEvent = getMockEventById(id);

    if (!existingEvent) {
      return this.apiConfig.createMockError(404, 'Événement non trouvé');
    }

    // Mise à jour des champs
    const updatedEvent: EventModel = {
      ...existingEvent,
      ...eventData,
      updatedAt: new Date()
    };

    // Mise à jour spécifique pour la catégorie si présente
    if (eventData.category) {
      updatedEvent.category = eventData.category;
    }

    // Dans un vrai environnement, on mettrait à jour dans allMockEvents
    // const index = allMockEvents.findIndex(e => e.id === id);
    // allMockEvents[index] = updatedEvent;

    return this.apiConfig.createMockResponse(updatedEvent);
  }

  /**
   * Version mock de la suppression d'un événement
   */
  private mockDeleteEvent(id: number): Observable<void> {
    const event = getMockEventById(id);

    if (!event) {
      return this.apiConfig.createMockError(404, 'Événement non trouvé');
    }

    // Dans un vrai environnement, on supprimerait de allMockEvents
    // const index = allMockEvents.findIndex(e => e.id === id);
    // if (index !== -1) {
    //   allMockEvents.splice(index, 1);
    // }

    return this.apiConfig.createMockResponse<void>(undefined);
  }

  /**
   * Version mock de la récupération des catégories d'événements
   */
  private mockGetEventCategories(): Observable<EventCategoryModel[]> {
    return this.apiConfig.createMockResponse(mockCategories);
  }

  /**
   * Version mock de la mise à jour du statut d'un événement
   */
  private mockUpdateEventStatus(id: number, status: EventStatus): Observable<EventModel> {
    const event = getMockEventById(id);

    if (!event) {
      return this.apiConfig.createMockError(404, 'Événement non trouvé');
    }

    const updatedEvent: EventModel = {
      ...event,
      status,
      updatedAt: new Date()
    };

    // Dans un vrai environnement, on mettrait à jour dans allMockEvents
    // const index = allMockEvents.findIndex(e => e.id === id);
    // allMockEvents[index] = updatedEvent;

    return this.apiConfig.createMockResponse(updatedEvent);
  }

  /**
   * Récupère les événements à afficher sur la page d'accueil
   */
  getHomePageEvents(count: number = APP_CONFIG.events.defaultHomeCount): Observable<EventModel[]> {
    const params: EventSearchParams = {
      status: 'published',
      displayOnHomepage: true,
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
  getFeaturedEvents(count: number = 3): Observable<EventModel[]> {
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
  getUpcomingEvents(params: EventSearchParams = {}): Observable<EventModel[]> {
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
  getEventsByStructure(structureId: number, params: EventSearchParams = {}): Observable<EventModel[]> {
    return this.getEvents({
      ...params,
      structureId
    });
  }
}
