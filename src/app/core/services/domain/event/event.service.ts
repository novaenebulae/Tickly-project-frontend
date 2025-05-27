/**
 * @file Domain service for managing events.
 * This service encapsulates business logic related to events, composes EventApiService
 * for API interactions, and CategoryService for category data. It manages state/cache for events.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject, signal, computed, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

// API and Domain Services
import { EventApiService } from '../../api/event/event-api.service';
import { CategoryService } from '../category.service'; // For resolving category objects
import { NotificationService } from '../utilities/notification.service';
import { AuthService } from '../user/auth.service';

// Models and DTOs
import { EventModel, EventDataDto, EventStatus } from '../../../models/event/event.model';
import { EventCategoryModel } from '../../../models/event/event-category.model';
import { EventSearchParams } from '../../../models/event/event-search-params.model';
import { EventAudienceZone, SeatingType } from '../../../models/event/event-audience-zone.model';
import { StructureAddressModel } from '../../../models/structure/structure-address.model'; // For address
import { StructureAreaModel } from '../../../models/structure/structure-area.model'; // For event.areas


// Configuration
import { APP_CONFIG } from '../../../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventApi = inject(EventApiService);
  private categoryService = inject(CategoryService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);

  // --- State Management using Signals ---
  private featuredEventsSig: WritableSignal<EventModel[]> = signal([]);
  public readonly featuredEvents = computed(() => this.featuredEventsSig());

  private homePageEventsSig: WritableSignal<EventModel[]> = signal([]);
  public readonly homePageEvents = computed(() => this.homePageEventsSig());

  // Cache for event details (Map: eventId -> EventModel)
  private eventDetailsCache = new Map<number, EventModel>();

  // No need for eventCategoriesSig here, CategoryService is the source of truth.

  constructor() {
    // Preload categories via CategoryService if it doesn't do it itself,
    // or ensure CategoryService is initialized.
    // CategoryService constructor already loads categories, so no action needed here usually.
  }

  // --- Event CRUD Operations ---

  /**
   * Retrieves a list of events based on search parameters.
   * Transforms raw API DTOs into `EventModel[]`.
   * @param params - Search parameters for filtering and sorting.
   * @returns An Observable of `EventModel[]`.
   */
  getEvents(params: EventSearchParams = {}): Observable<EventModel[]> {
    // EventApiService.getEvents now directly accepts EventSearchParams.
    // The conversion to HttpParams is handled within EventApiService.
    return this.eventApi.getEvents(params).pipe(
      map(apiEvents => this.mapApiEventsToEventModels(apiEvents)),
      catchError(error => {
        this.handleError('Impossible de récupérer la liste des événements.', error);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single event by its ID.
   * Uses cache if available, otherwise fetches from API.
   * @param id - The ID of the event to retrieve.
   * @param forceRefresh - If true, fetches from API even if in cache.
   * @returns An Observable of `EventModel` or `undefined` if not found/error.
   */
  getEventById(id: number, forceRefresh = false): Observable<EventModel | undefined> {
    if (!forceRefresh && this.eventDetailsCache.has(id)) {
      return of(this.eventDetailsCache.get(id));
    }
    return this.eventApi.getEventById(id).pipe(
      map(apiEvent => this.mapApiEventToEventModel(apiEvent)),
      tap(eventModel => {
        if (eventModel) {
          this.eventDetailsCache.set(id, eventModel);
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer les détails de l'événement #${id}.`, error);
        this.eventDetailsCache.delete(id); // Remove potentially stale/error entry
        return of(undefined);
      })
    );
  }

  /**
   * Creates a new event.
   * Prepares the API DTO from `EventDataDto`.
   * @param eventData - The `EventDataDto` for creating the event.
   * @returns An Observable of the created `EventModel` or `undefined` on error.
   */
  createEvent(eventData: EventDataDto): Observable<EventModel | undefined> {
    const apiEventData = this.mapEventDataDtoToApiDto(eventData);
    return this.eventApi.createEvent(apiEventData).pipe(
      map(apiEvent => this.mapApiEventToEventModel(apiEvent)),
      tap(newEvent => {
        if (newEvent) {
          this.notification.displayNotification('Événement créé avec succès !', 'valid');
          this.eventDetailsCache.set(newEvent.id!, newEvent); // Cache the new event
          this.refreshRelevantCachedLists(newEvent);
        }
      }),
      catchError(error => {
        this.handleError('Impossible de créer l\'événement.', error);
        return of(undefined);
      })
    );
  }

  /**
   * Updates an existing event.
   * @param eventId - The ID of the event to update.
   * @param eventUpdateData - Partial `EventDataDto` with fields to update.
   * @returns An Observable of the updated `EventModel` or `undefined` on error.
   */
  updateEvent(eventId: number, eventUpdateData: Partial<EventDataDto>): Observable<EventModel | undefined> {
    const apiEventData = this.mapEventDataDtoToApiDto(eventUpdateData, eventId);
    return this.eventApi.updateEvent(eventId, apiEventData).pipe(
      map(apiEvent => this.mapApiEventToEventModel(apiEvent)),
      tap(updatedEvent => {
        if (updatedEvent) {
          this.eventDetailsCache.set(eventId, updatedEvent);
          this.refreshRelevantCachedLists(updatedEvent);
          this.notification.displayNotification('Événement mis à jour avec succès.', 'valid');
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de mettre à jour l'événement #${eventId}.`, error);
        return of(undefined);
      })
    );
  }

  /**
   * Deletes an event by its ID.
   * @param eventId - The ID of the event to delete.
   * @returns An Observable<boolean> indicating success (true) or failure (false).
   */
  deleteEvent(eventId: number): Observable<boolean> {
    return this.eventApi.deleteEvent(eventId).pipe(
      map(() => true),
      tap(() => {
        const deletedEvent = this.eventDetailsCache.get(eventId);
        this.eventDetailsCache.delete(eventId);
        if (deletedEvent) { // If we had details, use them to know if lists need refresh
          this.refreshRelevantCachedLists(deletedEvent, true); // Mark as deleted for refresh logic
        } else { // If no details, refresh all potentially affected lists
          this.refreshHomePageEvents(true).subscribe();
          this.refreshFeaturedEvents(true).subscribe();
        }
        this.notification.displayNotification('Événement supprimé avec succès.', 'valid');
      }),
      catchError(error => {
        this.handleError(`Impossible de supprimer l'événement #${eventId}.`, error);
        return of(false);
      })
    );
  }

  /**
   * Updates the status of an event.
   * @param eventId - The ID of the event.
   * @param status - The new `EventStatus`.
   * @returns An Observable of the updated `EventModel` or `undefined` on error.
   */
  updateEventStatus(eventId: number, status: EventStatus): Observable<EventModel | undefined> {
    return this.eventApi.updateEventStatus(eventId, status).pipe(
      map(apiEvent => this.mapApiEventToEventModel(apiEvent)),
      tap(updatedEvent => {
        if (updatedEvent) {
          this.eventDetailsCache.set(eventId, updatedEvent);
          this.refreshRelevantCachedLists(updatedEvent);
          this.notification.displayNotification(`Statut de l'événement mis à jour en : ${status}`, 'valid');
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de mettre à jour le statut de l'événement #${eventId}.`, error);
        return of(undefined);
      })
    );
  }

  // --- Specialized Event Fetching Methods ---

  /**
   * Searches for events based on a search term and additional parameters.
   * @param searchTerm - The primary search query.
   * @param additionalParams - Additional `EventSearchParams`.
   * @returns An Observable of `EventModel[]`.
   */
  searchEvents(searchTerm: string, additionalParams: Partial<EventSearchParams> = {}): Observable<EventModel[]> {
    const params: EventSearchParams = { query: searchTerm, ...additionalParams };
    return this.eventApi.searchEvents(params).pipe( // EventApiService handles HttpParams conversion
      map(apiEvents => this.mapApiEventsToEventModels(apiEvents)),
      catchError(error => {
        this.handleError("Erreur lors de la recherche d'événements.", error);
        return of([]);
      })
    );
  }

  getHomePageEvents(forceRefresh = false, count = APP_CONFIG.events.defaultHomeCount): Observable<EventModel[]> {
    if (!forceRefresh && this.homePageEventsSig().length > 0 && this.homePageEventsSig().length >= count) {
      return of(this.homePageEventsSig().slice(0, count));
    }
    return this.eventApi.getHomePageEvents(count).pipe(
      map(apiEvents => this.mapApiEventsToEventModels(apiEvents)),
      tap(events => this.homePageEventsSig.set(events)),
      catchError(error => {
        this.handleError("Impossible de récupérer les événements pour la page d'accueil.", error);
        return of([]);
      })
    );
  }

  getFeaturedEvents(forceRefresh = false, count = APP_CONFIG.events.defaultFeaturedCount): Observable<EventModel[]> {
    if (!forceRefresh && this.featuredEventsSig().length > 0 && this.featuredEventsSig().length >= count) {
      return of(this.featuredEventsSig().slice(0, count));
    }
    return this.eventApi.getFeaturedEvents(count).pipe(
      map(apiEvents => this.mapApiEventsToEventModels(apiEvents)),
      tap(events => this.featuredEventsSig.set(events)),
      catchError(error => {
        this.handleError('Impossible de récupérer les événements mis en avant.', error);
        return of([]);
      })
    );
  }

  getUpcomingEvents(params: Partial<EventSearchParams> = {}): Observable<EventModel[]> {
    return this.eventApi.getUpcomingEvents(params).pipe( // EventApiService handles HttpParams conversion
      map(apiEvents => this.mapApiEventsToEventModels(apiEvents)),
      catchError(error => {
        this.handleError('Impossible de récupérer les événements à venir.', error);
        return of([]);
      })
    );
  }

  getEventsByStructure(structureId: number, params: Partial<EventSearchParams> = {}): Observable<EventModel[]> {
    const searchParams: EventSearchParams = { ...params, structureId: structureId };
    return this.eventApi.getEventsByStructure(structureId, searchParams).pipe( // EventApiService handles HttpParams
      map(apiEvents => this.mapApiEventsToEventModels(apiEvents)),
      catchError(error => {
        this.handleError(`Impossible de récupérer les événements pour la structure #${structureId}.`, error);
        return of([]);
      })
    );
  }

  getLatestEvents(count: number): Observable<EventModel[]> {
    const params: EventSearchParams = {
      sortBy: 'createdAt',
      sortDirection: 'desc',
      pageSize: count,
      page: 0
    };
    return this.getEvents(params);
  }

  // --- Cache Refresh Logic ---

  private refreshHomePageEvents(force = true): Observable<EventModel[]> {
    return this.getHomePageEvents(force);
  }

  private refreshFeaturedEvents(force = true): Observable<EventModel[]> {
    return this.getFeaturedEvents(force);
  }

  /**
   * Refreshes cached lists (homepage, featured) if the provided event might affect them.
   * @param event - The event that was created, updated, or deleted.
   * @param wasDeleted - If true, the event was deleted, so it should be removed from lists.
   */
  private refreshRelevantCachedLists(event: EventModel, wasDeleted = false): void {
    let needsHomePageRefresh = false;
    let needsFeaturedRefresh = false;

    if (wasDeleted) {
      // If an event that *was* on homepage/featured is deleted, refresh those lists.
      if (this.homePageEventsSig().some(e => e.id === event.id)) needsHomePageRefresh = true;
      if (this.featuredEventsSig().some(e => e.id === event.id)) needsFeaturedRefresh = true;
    } else {
      // If event is now on homepage/featured, or was and is no longer, refresh.
      const isOnHomepage = this.homePageEventsSig().some(e => e.id === event.id);
      const isOnFeatured = this.featuredEventsSig().some(e => e.id === event.id);

      if (event.displayOnHomepage !== isOnHomepage) needsHomePageRefresh = true;
      if (event.isFeaturedEvent !== isOnFeatured) needsFeaturedRefresh = true;

      // Also refresh if it's a new addition to these lists
      if (event.displayOnHomepage && !isOnHomepage) needsHomePageRefresh = true;
      if (event.isFeaturedEvent && !isOnFeatured) needsFeaturedRefresh = true;
    }

    if (needsHomePageRefresh) {
      this.refreshHomePageEvents(true).subscribe();
    }
    if (needsFeaturedRefresh) {
      this.refreshFeaturedEvents(true).subscribe();
    }
  }

  // --- Data Transformation ---

  /**
   * Maps a raw API event DTO to an `EventModel`.
   * @param apiEvent - The raw event object from the API.
   * @returns An `EventModel` or `undefined` if apiEvent is falsy.
   */
  private mapApiEventToEventModel(apiEvent: any): EventModel | undefined {
    if (!apiEvent) return undefined;

    // Resolve category: API sends category as an object {id, name}
    // or it might send categoryId. CategoryService helps resolve.
    let categoryModel: EventCategoryModel;
    if (apiEvent.category && typeof apiEvent.category === 'object') {
      categoryModel = { id: apiEvent.category.id, name: apiEvent.category.name };
    } else if (apiEvent.categoryId) {
      categoryModel = this.categoryService.getCategoryById(apiEvent.categoryId) ||
        { id: apiEvent.categoryId, name: 'Catégorie Inconnue' };
    } else {
      categoryModel = { id: 0, name: 'Non Catégorisé' }; // Fallback
    }

    // Map audienceZones: API sends audienceZones array directly matching EventAudienceZone
    const audienceZones: EventAudienceZone[] = (apiEvent.audienceZones || []).map((az: any) => ({
      id: az.id,
      name: az.name,
      areaId: az.areaId,
      maxCapacity: az.maxCapacity,
      isActive: az.isActive,
      seatingType: az.seatingType as SeatingType
    }));

    const event: EventModel = {
      id: apiEvent.id,
      name: apiEvent.name,
      category: categoryModel,
      shortDescription: apiEvent.shortDescription,
      fullDescription: apiEvent.fullDescription,
      tags: apiEvent.tags || [],
      startDate: new Date(apiEvent.startDate),
      endDate: new Date(apiEvent.endDate),
      address: apiEvent.address as StructureAddressModel || this.createEmptyAddress(),
      structureId: apiEvent.structureId,
      areas: (apiEvent.areas || []) as StructureAreaModel[], // Assuming API returns StructureAreaModel like objects
      isFreeEvent: apiEvent.isFreeEvent,
      defaultSeatingType: apiEvent.defaultSeatingType as SeatingType || SeatingType.MIXED,
      audienceZones: audienceZones,
      displayOnHomepage: apiEvent.displayOnHomepage || false,
      isFeaturedEvent: apiEvent.isFeaturedEvent || false,
      links: apiEvent.links || [],
      mainPhotoUrl: apiEvent.mainPhotoUrl,
      eventPhotoUrls: apiEvent.eventPhotoUrls || [],
      status: apiEvent.status as EventStatus,
      createdAt: apiEvent.createdAt ? new Date(apiEvent.createdAt) : undefined,
      updatedAt: apiEvent.updatedAt ? new Date(apiEvent.updatedAt) : undefined,
    };
    return event;
  }

  private mapApiEventsToEventModels(apiEvents: any[]): EventModel[] {
    if (!apiEvents || !Array.isArray(apiEvents)) return [];
    return apiEvents
      .map(apiEvent => this.mapApiEventToEventModel(apiEvent))
      .filter((event): event is EventModel => event !== undefined);
  }

  /**
   * Maps `EventDataDto` (from forms) to the DTO format expected by `EventApiService`.
   * @param eventData - The event data from the application (form DTO).
   * @param eventIdForUpdate - Optional: The ID of the event if it's an update operation.
   * @returns The DTO object ready for the API service.
   */
  private mapEventDataDtoToApiDto(eventData: Partial<EventDataDto> | EventDataDto, eventIdForUpdate?: number): any {
    const apiDto: any = { ...eventData }; // Start with a shallow copy

    // Ensure categoryId is present if category object was in eventData
    if (typeof eventData.categoryId === 'number') { // If category was already an ID
      apiDto.categoryId = eventData.categoryId;
    }
    delete apiDto.category; // API DTO should not have the 'category' object, only 'categoryId'

    // Ensure audienceZones are in the correct format (without client-side only properties)
    // and omit 'id' for new zones when creating an event.
    // For updates, 'id' should be present for existing zones.
    if (apiDto.audienceZones) {
      apiDto.audienceZones = apiDto.audienceZones.map((zone: EventAudienceZone | Omit<EventAudienceZone, 'id'>) => {
        const apiZone: any = {
          name: zone.name,
          areaId: zone.areaId,
          maxCapacity: zone.maxCapacity,
          isActive: zone.isActive,
          seatingType: zone.seatingType
        };
        if ('id' in zone && zone.id !== undefined && eventIdForUpdate) { // Only include ID for existing zones during an update
          apiZone.id = zone.id;
        }
        return apiZone;
      });
    }

    // Remove dates if they are not actual Date objects or are null (API might not like null dates)
    if (apiDto.startDate && !(apiDto.startDate instanceof Date)) delete apiDto.startDate;
    if (apiDto.endDate && !(apiDto.endDate instanceof Date)) delete apiDto.endDate;


    // Structure ID: Your previous code had createdByStructureId for new events.
    // If API differentiates, handle it. If structureId is always just structureId:
    // if (eventData.structureId && !eventIdForUpdate) { // For new events
    //   apiDto.structureId = eventData.structureId;
    // }
    // If API uses 'createdByStructureId' for new events, and 'structureId' for existing.
    // The EventDataDto already has structureId. EventApiService will send this as is.

    return apiDto;
  }

  private createEmptyAddress(): StructureAddressModel {
    return { country: '', city: '', street: '', zipCode: '' };
  }

  // --- Utility and Helper Methods ---

  /**
   * Checks if the current user can edit the given event.
   * (This logic might involve checking against AuthService.currentUser's structureId)
   * @param event - The event to check.
   * @returns True if the user can edit the event, false otherwise.
   */
  canEditEvent(event: EventModel): boolean {
    if (!event || !event.id) return false;
    const currentAuthUser = this.authService.currentUser();
    if (!currentAuthUser || !currentAuthUser.structureId) return false; // User not logged in or no structureId

    // Example: User can edit if they belong to the structure that created/hosts the event
    return event.structureId === currentAuthUser.structureId;
  }

  /**
   * Filters a list of events to include only upcoming or past events.
   * @param events - The array of `EventModel` to filter.
   * @param includePast - If false (default), only upcoming/ongoing events are returned. If true, all events are returned (or only past ones if you adapt logic).
   * @returns A filtered array of `EventModel`.
   */
  filterEventsByDate(events: EventModel[], includePast = false): EventModel[] {
    if (includePast) {
      return events; // Or filter for only past events if that's the intent
    }
    const now = new Date();
    return events.filter(event => new Date(event.endDate) >= now);
  }

  private handleError(userMessage: string, error: any): void {
    // error object from EventApiService already contains a user-friendly 'message'
    console.error(`EventService Error: ${userMessage}`, error.originalError || error);
    this.notification.displayNotification(
      error.message || userMessage, // Use error.message if available
      'error'
    );
  }
}
