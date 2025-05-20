// src/app/core/services/domain/event.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

// Services
import { NotificationService} from './notification.service';
import { EventApiService } from '../api/event-api.service';

// Models
import { EventModel, EventCreationDto, EventStatus } from '../../models/event/event.model';
import { EventCategoryModel } from '../../models/event/event-category.model';
import { APP_CONFIG } from '../../config/app-config';
import {EventSeatingZone, SeatingType} from '../../models/event/seating.model';
import { EventSearchParams } from '../../models/event/event-search-params.model';

/**
 * Service de gestion des événements
 * Couche métier qui encapsule les appels API et la logique spécifique aux événements
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventApi = inject(EventApiService);
  private notification = inject(NotificationService);

  // Signaux pour stocker les données en cache
  private featuredEventsSig = signal<EventModel[]>([]);
  private homePageEventsSig = signal<EventModel[]>([]);
  private eventCategoriesSig = signal<EventCategoryModel[]>([]);

  // Exposer les données en lecture seule
  readonly featuredEvents = computed(() => this.featuredEventsSig());
  readonly homePageEvents = computed(() => this.homePageEventsSig());
  readonly eventCategories = computed(() => this.eventCategoriesSig());

  // Cache pour les détails d'événement (Map<id, EventModel>)
  private eventDetailsCache = new Map<number, EventModel>();

  constructor() {
    // Précharger certaines données au démarrage
    this.loadEventCategories();
  }

  /**
   * Récupère tous les événements avec possibilité de filtrage
   * @param params Paramètres de recherche et de filtrage
   */
  getEvents(params: EventSearchParams = {}): Observable<EventModel[]> {
    return this.eventApi.getEvents(this.adaptToApiParams(params)).pipe(
      map(events => this.convertToEventModels(events)),
      catchError(error => {
        this.handleError('Impossible de récupérer les événements', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère un événement par son ID, avec mise en cache
   * @param id ID de l'événement à récupérer
   * @param forceRefresh Force le rechargement même si en cache
   */
  getEventById(id: number, forceRefresh = false): Observable<EventModel | undefined> {
    // Vérifier si l'événement est en cache et si on ne force pas le rafraîchissement
    if (!forceRefresh && this.eventDetailsCache.has(id)) {
      return of(this.eventDetailsCache.get(id));
    }

    return this.eventApi.getEventById(id).pipe(
      map(event => this.convertToEventModel(event)),
      tap(event => {
        if (event) {
          // Mettre en cache l'événement récupéré
          this.eventDetailsCache.set(id, event);
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer l'événement #${id}`, error);
        return of(undefined);
      })
    );
  }

  /**
   * Crée un nouvel événement
   * @param eventData Données de l'événement à créer
   */
  createEvent(eventData: EventCreationDto): Observable<EventModel | undefined> {
    const apiEventData = this.convertToApiEventData(eventData);

    return this.eventApi.createEvent(apiEventData).pipe(
      map(event => this.convertToEventModel(event)),
      tap(newEvent => {
        if (newEvent) {
          this.notification.displayNotification(
            'Événement créé avec succès',
            'valid',
            'Fermer'
          );

          // Mettre à jour le cache si nécessaire
          if (newEvent.isFeaturedEvent) {
            this.refreshFeaturedEvents();
          }
          if (newEvent.displayOnHomepage) {
            this.refreshHomePageEvents();
          }
        }
      }),
      catchError(error => {
        this.handleError('Impossible de créer l\'événement', error);
        return of(undefined);
      })
    );
  }

  /**
   * Met à jour un événement existant
   * @param id ID de l'événement à mettre à jour
   * @param eventData Données mises à jour de l'événement
   */
  updateEvent(id: number, eventData: Partial<EventModel>): Observable<EventModel | undefined> {
    const apiEventData = this.convertToApiEventData(eventData);

    return this.eventApi.updateEvent(id, apiEventData).pipe(
      map(event => this.convertToEventModel(event)),
      tap(updatedEvent => {
        if (updatedEvent) {
          // Mettre à jour le cache
          if (this.eventDetailsCache.has(id)) {
            this.eventDetailsCache.set(id, updatedEvent);
          }

          // Rafraîchir les listes si nécessaire
          this.refreshCachedLists(updatedEvent);

          this.notification.displayNotification(
            'Événement mis à jour avec succès',
            'valid',
            'Fermer'
          );
        }
      }),
      catchError(error => {
        this.handleError('Impossible de mettre à jour l\'événement', error);
        return of(undefined);
      })
    );
  }

  /**
   * Supprime un événement
   * @param id ID de l'événement à supprimer
   */
  deleteEvent(id: number): Observable<boolean> {
    return this.eventApi.deleteEvent(id).pipe(
      map(() => true),
      tap(() => {
        // Supprimer du cache
        this.eventDetailsCache.delete(id);

        // Rafraîchir les listes car on a supprimé un événement
        this.refreshFeaturedEvents();
        this.refreshHomePageEvents();

        this.notification.displayNotification(
          'Événement supprimé avec succès',
          'valid',
          'Fermer'
        );
      }),
      catchError(error => {
        this.handleError('Impossible de supprimer l\'événement', error);
        return of(false);
      })
    );
  }

  /**
   * Change le statut d'un événement
   * @param id ID de l'événement
   * @param status Nouveau statut
   */
  updateEventStatus(id: number, status: EventStatus): Observable<EventModel | undefined> {
    return this.eventApi.updateEventStatus(id, status).pipe(
      map(event => this.convertToEventModel(event)),
      tap(updatedEvent => {
        if (updatedEvent) {
          // Mettre à jour le cache
          if (this.eventDetailsCache.has(id)) {
            this.eventDetailsCache.set(id, updatedEvent);
          }

          // Rafraîchir les listes car le changement de statut peut affecter la visibilité
          this.refreshCachedLists(updatedEvent);

          this.notification.displayNotification(
            `Statut de l'événement mis à jour: ${status}`,
            'valid',
            'Fermer'
          );
        }
      }),
      catchError(error => {
        this.handleError('Impossible de mettre à jour le statut', error);
        return of(undefined);
      })
    );
  }

  /**
   * Recherche des événements avec un terme de recherche
   * @param searchTerm Terme de recherche
   * @param additionalParams Paramètres supplémentaires pour le filtrage
   */
  searchEvents(searchTerm: string, additionalParams: Partial<EventSearchParams> = {}): Observable<EventModel[]> {
    const params = this.adaptToApiParams({
      query: searchTerm,
      ...additionalParams
    });

    return this.eventApi.searchEvents(params).pipe(
      map(events => this.convertToEventModels(events)),
      catchError(error => {
        this.handleError('Erreur lors de la recherche d\'événements', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les événements à afficher sur la page d'accueil
   * @param forceRefresh Force le rechargement même si des données sont en cache
   */
  getHomePageEvents(forceRefresh = false, count = APP_CONFIG.events.defaultHomeCount): Observable<EventModel[]> {
    // Si des données sont en cache et qu'on ne force pas le rafraîchissement
    if (!forceRefresh && this.homePageEventsSig().length > 0) {
      return of(this.homePageEventsSig());
    }

    return this.eventApi.getHomePageEvents(count).pipe(
      map(events => this.convertToEventModels(events)),
      tap(events => {
        this.homePageEventsSig.set(events);
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer les événements de la page d\'accueil', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les événements mis en avant
   * @param forceRefresh Force le rechargement même si des données sont en cache
   */
  getFeaturedEvents(forceRefresh = false, count = 3): Observable<EventModel[]> {
    // Si des données sont en cache et qu'on ne force pas le rafraîchissement
    if (!forceRefresh && this.featuredEventsSig().length > 0) {
      return of(this.featuredEventsSig());
    }

    return this.eventApi.getFeaturedEvents(count).pipe(
      map(events => this.convertToEventModels(events)),
      tap(events => {
        this.featuredEventsSig.set(events);
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer les événements mis en avant', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les événements à venir (après aujourd'hui)
   */
  getUpcomingEvents(params: Partial<EventSearchParams> = {}): Observable<EventModel[]> {
    const apiParams = this.adaptToApiParams(params);

    return this.eventApi.getUpcomingEvents(apiParams).pipe(
      map(events => this.convertToEventModels(events)),
      catchError(error => {
        this.handleError('Impossible de récupérer les événements à venir', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les événements créés par une structure spécifique
   * @param structureId ID de la structure
   */
  getEventsByStructure(structureId: number, params: Partial<EventSearchParams> = {}): Observable<EventModel[]> {
    const apiParams = this.adaptToApiParams({
      ...params,
      structureId
    });

    return this.eventApi.getEventsByStructure(structureId, apiParams).pipe(
      map(events => this.convertToEventModels(events)),
      catchError(error => {
        this.handleError(`Impossible de récupérer les événements de la structure #${structureId}`, error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les derniers événements ajoutés, triés par date de création
   * @param count Nombre d'événements à retourner
   */
  getLatestEvents(count: number): Observable<EventModel[]> {
    const params = this.adaptToApiParams({
      sortBy: 'createdAt',
      sortDirection: 'desc',
      pageSize: count,
      page: 0
    });

    return this.getEvents(params);
  }

  /**
   * Récupère les catégories d'événements disponibles
   * @param forceRefresh Force le rechargement même si des données sont en cache
   */
  getEventCategories(forceRefresh = false): Observable<EventCategoryModel[]> {
    // Si des données sont en cache et qu'on ne force pas le rafraîchissement
    if (!forceRefresh && this.eventCategoriesSig().length > 0) {
      return of(this.eventCategoriesSig());
    }

    return this.loadEventCategories();
  }

  /**
   * Charge les catégories d'événements depuis l'API
   */
  private loadEventCategories(): Observable<EventCategoryModel[]> {
    return this.eventApi.getEventCategories().pipe(
      map(categories => {
        // Transformer en EventCategoryModel[]
        return categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }));
      }),
      tap(categories => {
        this.eventCategoriesSig.set(categories);
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer les catégories d\'événements', error);
        return of([]);
      })
    );
  }

  /**
   * Rafraîchit les événements de la page d'accueil
   */
  private refreshHomePageEvents(): void {
    if (this.homePageEventsSig().length > 0) {
      this.getHomePageEvents(true).subscribe();
    }
  }

  /**
   * Rafraîchit les événements mis en avant
   */
  private refreshFeaturedEvents(): void {
    if (this.featuredEventsSig().length > 0) {
      this.getFeaturedEvents(true).subscribe();
    }
  }

  /**
   * Rafraîchit les listes en cache si nécessaire en fonction de l'événement modifié
   */
  private refreshCachedLists(event: EventModel): void {
    if (event.displayOnHomepage) {
      this.refreshHomePageEvents();
    }
    if (event.isFeaturedEvent) {
      this.refreshFeaturedEvents();
    }
  }

  /**
   * Convertit l'événement du modèle API vers le modèle d'application
   */
  private convertToEventModel(apiEvent: any): EventModel | undefined {
    if (!apiEvent) return undefined;

    // Adapter le modèle API vers notre modèle EventModel
    const eventModel: EventModel = {
      id: apiEvent.id,
      name: apiEvent.name,
      category: {
        id: typeof apiEvent.category === 'object' ? apiEvent.category.id : 0,
        name: typeof apiEvent.category === 'object' ? apiEvent.category.name : apiEvent.category
      },
      shortDescription: apiEvent.shortDescription,
      fullDescription: apiEvent.fullDescription,
      tags: apiEvent.tags,
      startDate: new Date(apiEvent.startDate),
      endDate: new Date(apiEvent.endDate),

      // Conversion des propriétés spécifiques
      address: apiEvent.address ?? {
        country: '',
        city: '',
        street: '',
        zipCode: ''
      },

      structureId: apiEvent.createdByStructureId || apiEvent.structureId,

      // Conversion des emplacements en zones de placement
      isFreeEvent: apiEvent.isFreeEvent,
      defaultSeatingType: apiEvent.defaultSeatingType || SeatingType.MIXED,

      // Utiliser directement seatingZones s'il existe, sinon convertir les locations si présents
      // Si aucun des deux n'existe, créer une zone par défaut pour les événements non gratuits
      seatingZones: apiEvent.seatingZones
        ? apiEvent.seatingZones
        : apiEvent.locations
          ? this.convertLocationsToSeatingZones(apiEvent.locations)
          : !apiEvent.isFreeEvent
            ? [this.createDefaultSeatingZone(apiEvent.id)]
            : [],

      displayOnHomepage: apiEvent.displayOnHomepage,
      isFeaturedEvent: apiEvent.isFeaturedEvent,

      links: apiEvent.links,
      mainPhotoUrl: apiEvent.mainPhotoUrl,
      eventPhotoUrls: apiEvent.eventPhotoUrls,

      status: apiEvent.status,
      createdAt: apiEvent.createdAt ? new Date(apiEvent.createdAt) : undefined,
      updatedAt: apiEvent.updatedAt ? new Date(apiEvent.updatedAt) : undefined
    };

    return eventModel;
  }

  /**
   * Crée une zone de placement par défaut pour les événements payants sans zones définies
   */
  private createDefaultSeatingZone(eventId: number): EventSeatingZone {
    return {
      id: eventId * 1000 + 1, // Générer un ID unique basé sur l'ID de l'événement
      name: 'Zone standard',
      areaId: eventId * 100,
      maxCapacity: 100,
      ticketPrice: 25.00, // Prix par défaut
      isActive: true,
      seatingType: SeatingType.MIXED
    };
  }

  /**
   * Convertit une liste d'événements API en EventModel[]
   */
  private convertToEventModels(apiEvents: any[]): EventModel[] {
    if (!apiEvents) return [];

    return apiEvents
      .map(event => this.convertToEventModel(event))
      .filter((event): event is EventModel => event !== undefined);
  }

  /**
   * Convertit les locations du modèle API en EventSeatingZone[]
   */
  private convertLocationsToSeatingZones(locations: any[]): EventSeatingZone[] {
    if (!locations) return [];

    return locations.map(loc => ({
      id: loc.locationId,
      name: loc.name,
      areaId: loc.areaId || 0, // Une valeur par défaut si non disponible
      maxCapacity: loc.maxCapacity,
      ticketPrice: loc.ticketPrice || 0,
      isActive: loc.active,
      seatingType: loc.seatingType || SeatingType.MIXED
    }));
  }

  /**
   * Convertit les paramètres de recherche du modèle d'application à celui de l'API
   */
  private adaptToApiParams(params: Partial<EventSearchParams>): any {
    const apiParams: any = {};

    // Copier les paramètres de base
    if (params.query) apiParams.query = params.query;
    if (params.status) apiParams.status = params.status;
    if (params.featured !== undefined) apiParams.featured = params.featured;
    if (params.free !== undefined) apiParams.free = params.free;
    if (params.structureId) apiParams.structureId = params.structureId;
    if (params.page !== undefined) apiParams.page = params.page;
    if (params.pageSize) apiParams.pageSize = params.pageSize;

    // Gérer le tri
    if (params.sortBy) {
      apiParams.sortBy = params.sortBy;
      // Si sortDirection est fourni, l'utiliser, sinon par défaut asc
      apiParams.sortDirection = params.sortDirection || 'asc';
    }

    // Gérer les catégories
    if (params.category !== undefined) {
      // Si c'est un tableau, prendre le premier élément ou convertir en string
      if (Array.isArray(params.category)) {
        if (params.category.length > 0) {
          // Si le premier élément est un objet avec un ID
          if (typeof params.category[0] === 'object' && 'id' in params.category[0]) {
            apiParams.category = params.category[0].id;
          } else {
            // Sinon, utiliser le premier élément tel quel
            apiParams.category = params.category[0];
          }
        }
      }
      // Si c'est un objet avec un ID
      else if (typeof params.category === 'object' && 'id' in params.category) {
        apiParams.category = params.category.id;
      }
      // Sinon, utiliser tel quel
      else {
        apiParams.category = params.category;
      }
    }
    // Utiliser categoryId s'il est fourni
    else if (params.categoryId) {
      apiParams.category = params.categoryId;
    }

    // Gérer les dates
    if (params.startDate) {
      apiParams.startDate = params.startDate instanceof Date
        ? params.startDate.toISOString()
        : params.startDate;
    }

    if (params.endDate) {
      apiParams.endDate = params.endDate instanceof Date
        ? params.endDate.toISOString()
        : params.endDate;
    }

    // Gérer la localisation
    if (params.location) {
      apiParams.location = params.location;
    }

    // Gérer les genres
    if (params.genres && Array.isArray(params.genres) && params.genres.length > 0) {
      apiParams.genres = params.genres.join(',');
    }

    return apiParams;
  }

  /**
   * Convertit les données d'événement du modèle d'application à celui de l'API
   */
  private convertToApiEventData(eventData: Partial<EventModel> | EventCreationDto): any {
    const apiEventData: any = { ...eventData };

    // Adapter les conversions spécifiques ici
    if ('seatingZones' in eventData && eventData.seatingZones) {
      apiEventData.locations = eventData.seatingZones.map(zone => ({
        // Utiliser une valeur par défaut (null) si l'ID est absent
        locationId: 'id' in zone ? zone.id : null,
        name: zone.name,
        areaId: zone.areaId,
        maxCapacity: zone.maxCapacity,
        ticketPrice: zone.ticketPrice,
        active: zone.isActive,
        seatingType: zone.seatingType
      }));

      delete apiEventData.seatingZones;
    }

    // Conversions pour la création d'événement
    if ('categoryId' in eventData) {
      apiEventData.category = eventData.categoryId;
      delete apiEventData.categoryId;
    }

    if ('areaIds' in eventData) {
      // Traiter les IDs de zone si nécessaire
      delete apiEventData.areaIds;
    }

    // Convertir structureId en createdByStructureId si nécessaire
    if ('structureId' in eventData) {
      apiEventData.createdByStructureId = eventData.structureId;
    }

    return apiEventData;
  }

  /**
   * Gère les erreurs en les journalisant et en affichant une notification
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.notification.displayNotification(
      error.message || message,
      'error',
      'Fermer'
    );
  }

  /**
   * Vérifie si un événement peut être édité par l'utilisateur actuel
   */
  canEditEvent(event: EventModel, currentUserStructureId?: number): boolean {
    if (!event) return false;

    // Si l'utilisateur appartient à la structure qui a créé l'événement
    if (currentUserStructureId && event.structureId === currentUserStructureId) {
      return true;
    }

    return false;
  }

  /**
   * Filtre les événements passés vs à venir
   * @param events Liste d'événements à filtrer
   * @param includePast Inclure les événements passés
   */
  filterEventsByDate(events: EventModel[], includePast = false): EventModel[] {
    const now = new Date();

    if (includePast) {
      return events;
    }

    return events.filter(event => {
      const endDate = new Date(event.endDate);
      return endDate >= now;
    });
  }
}
