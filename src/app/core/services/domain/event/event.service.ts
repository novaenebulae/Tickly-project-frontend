/**
 * @file Domain service for managing events.
 * This service encapsulates business logic related to events, composes EventApiService
 * for API interactions, and CategoryService for category data. It manages state/cache for events.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';

// API and Domain Services
import {EventApiService} from '../../api/event/event-api.service';
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';
import {UserRole} from '../../../models/user/user-role.enum';

// Models and DTOs
import {EventDataDto, EventModel, EventStatus, EventSummaryModel} from '../../../models/event/event.model';
import {EventSearchParams} from '../../../models/event/event-search-params.model';
import {
  EventAudienceZone,
  EventAudienceZoneConfigDto,
  SeatingType
} from '../../../models/event/event-audience-zone.model';
import {StructureAddressModel} from '../../../models/structure/structure-address.model'; // For address
import {StructureAreaModel} from '../../../models/structure/structure-area.model'; // For event.areas
// Configuration
import {APP_CONFIG} from '../../../config/app-config';
import {FileUploadResponseDto} from '../../../models/files/file-upload-response.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventApi = inject(EventApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);

  // --- State Management using Signals ---
  private featuredEventsSig: WritableSignal<EventSummaryModel[]> = signal([]);

  private homePageEventsSig: WritableSignal<EventSummaryModel[]> = signal([]);


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
  getEvents(params: EventSearchParams = {}): Observable<EventSummaryModel[]> {
    return this.eventApi.getEvents(params).pipe(
      map((response: any) => {
        if (response && Array.isArray(response.items)) {
          return this.mapApiEventsToEventSummaryModels(response.items);
        }
        console.warn('API response for events did not contain an "items" array.');
        return [];
      }),
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
   * @param forceRefresh - If true, forces a refresh of the relevant lists after creation.
   * @returns An Observable of the created `EventModel` or `undefined` on error.
   */
  createEvent(eventData: EventDataDto, forceRefresh: boolean = true): Observable<EventModel | undefined> {
    // Check if user has permission to manage events
    if (!this.hasEventManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour créer un événement.',
        'error'
      );
      return of(undefined);
    }

    const apiEventData = this.mapEventDataDtoToApiDto(eventData);
    return this.eventApi.createEvent(apiEventData, forceRefresh).pipe(
      map(apiEvent => this.mapApiEventToEventModel(apiEvent)),
      tap(newEvent => {
        if (newEvent) {
          this.notification.displayNotification('Événement créé avec succès !', 'valid');
          this.eventDetailsCache.set(newEvent.id!, newEvent); // Cache the new event
          if (forceRefresh) {
            this.refreshRelevantCachedLists(newEvent);
          }
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
   * @param forceRefresh - If true, forces a refresh of the relevant lists after update.
   * @returns An Observable of the updated `EventModel` or `undefined` on error.
   */
  updateEvent(eventId: number, eventUpdateData: Partial<EventDataDto>, forceRefresh: boolean = true): Observable<EventModel | undefined> {
    // Check if user has permission to manage events
    if (!this.hasEventManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour modifier un événement.',
        'error'
      );
      return of(undefined);
    }

    // Get the event to check if the user can edit it
    return this.getEventById(eventId).pipe(
      switchMap(event => {
        if (!event) {
          this.notification.displayNotification(`Événement #${eventId} non trouvé.`, 'error');
          return of(undefined);
        }

        if (!this.canEditEvent(event)) {
          this.notification.displayNotification(
            'Vous ne pouvez pas modifier cet événement car il n\'appartient pas à votre structure.',
            'error'
          );
          return of(undefined);
        }

        const apiEventData = this.mapEventDataDtoToApiDto(eventUpdateData, eventId);
        return this.eventApi.updateEvent(eventId, apiEventData, forceRefresh).pipe(
          map(apiEvent => this.mapApiEventToEventModel(apiEvent)),
          tap(updatedEvent => {
            if (updatedEvent) {
              this.eventDetailsCache.set(eventId, updatedEvent);
              if (forceRefresh) {
                this.refreshRelevantCachedLists(updatedEvent);
              }
              this.notification.displayNotification('Événement mis à jour avec succès.', 'valid');
            }
          }),
          catchError(error => {
            this.handleError(`Impossible de mettre à jour l'événement #${eventId}.`, error);
            return of(undefined);
          })
        );
      })
    );
  }

  /**
   * Deletes an event by its ID.
   * @param eventId - The ID of the event to delete.
   * @returns An Observable<boolean> indicating success (true) or failure (false).
   */
  deleteEvent(eventId: number): Observable<boolean> {
    // Check if user has permission to manage events
    if (!this.hasEventManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour supprimer un événement.',
        'error'
      );
      return of(false);
    }

    // Get the event to check if the user can delete it
    return this.getEventById(eventId).pipe(
      switchMap(event => {
        if (!event) {
          this.notification.displayNotification(`Événement #${eventId} non trouvé.`, 'error');
          return of(false);
        }

        if (!this.canEditEvent(event)) {
          this.notification.displayNotification(
            'Vous ne pouvez pas supprimer cet événement car il n\'appartient pas à votre structure.',
            'error'
          );
          return of(false);
        }

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
    // Check if user has permission to manage events
    if (!this.hasEventManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour modifier le statut d\'un événement.',
        'error'
      );
      return of(undefined);
    }

    // Get the event to check if the user can update its status
    return this.getEventById(eventId).pipe(
      switchMap(event => {
        if (!event) {
          this.notification.displayNotification(`Événement #${eventId} non trouvé.`, 'error');
          return of(undefined);
        }

        if (!this.canEditEvent(event)) {
          this.notification.displayNotification(
            'Vous ne pouvez pas modifier le statut de cet événement car il n\'appartient pas à votre structure.',
            'error'
          );
          return of(undefined);
        }

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
  searchEvents(searchTerm: string, additionalParams: Partial<EventSearchParams> = {}): Observable<EventSummaryModel[]> {
    const params: EventSearchParams = { query: searchTerm, ...additionalParams };
    return this.eventApi.searchEvents(params).pipe( // EventApiService handles HttpParams conversion
      map(apiEvents => this.mapApiEventsToEventSummaryModels(apiEvents)),
      catchError(error => {
        this.handleError("Erreur lors de la recherche d'événements.", error);
        return of([]);
      })
    );
  }


  /**
   * Rafraîchit la liste des événements mis en avant
   * @param forceRefresh - Force le rechargement depuis l'API
   */
  refreshFeaturedEvents(forceRefresh = false, count = APP_CONFIG.events.defaultFeaturedCount): Observable<EventSummaryModel[]> {
    return this.getFeaturedEvents(forceRefresh, count);
  }

  getHomePageEvents(forceRefresh = false, count = APP_CONFIG.events.defaultHomeCount): Observable<EventSummaryModel[]> {
    if (!forceRefresh && this.homePageEventsSig().length > 0 && this.homePageEventsSig().length >= count) {
      return of(this.homePageEventsSig().slice(0, count));
    }
    return this.getEvents({
      status: EventStatus.PUBLISHED,
      displayOnHomepage: true,
      sortBy: 'startDate',
      sortDirection: 'asc',
      pageSize: count,
      page: 0
    }).pipe(
      map(apiEvents => this.mapApiEventsToEventSummaryModels(apiEvents)),
      tap(events => this.homePageEventsSig.set(events)),
      catchError(error => {
        this.handleError("Impossible de récupérer les événements pour la page d'accueil.", error);
        return of([]);
      })
    );
  }

  getFeaturedEvents(forceRefresh = false, count = APP_CONFIG.events.defaultFeaturedCount): Observable<EventSummaryModel[]> {
    if (!forceRefresh && this.featuredEventsSig().length > 0 && this.featuredEventsSig().length >= count) {
      return of(this.featuredEventsSig().slice(0, count));
    }
    return this.eventApi.getFeaturedEvents(count).pipe(
      map((response: any) => {
        if (response && Array.isArray(response.items)) {
          return this.mapApiEventsToEventSummaryModels(response.items);
        }
        console.warn('API response for featured events did not contain an "items" array.');
        return [];
      }),
      tap(events => this.featuredEventsSig.set(events)),
      catchError(error => {
        this.handleError('Impossible de récupérer les événements mis en avant.', error);
        return of([]);
      })
    );
  }

  getEventsByStructure(structureId: number, params: Partial<EventSearchParams> = {}): Observable<EventSummaryModel[]> {

    const searchParams: EventSearchParams = { ...params, structureId: structureId };
    return this.eventApi.getEventsByStructure(structureId, searchParams).pipe(
      map((response: any) => {
        if (response && Array.isArray(response.items)) {
          return this.mapApiEventsToEventSummaryModels(response.items);
        }
        console.warn('API response for structure events did not contain an "items" array.');
        return [];
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer les événements pour la structure #${structureId}.`, error);
        return of([]);
      })
    );
  }

  // --- Cache Refresh Logic ---

  private refreshHomePageEvents(force = true): Observable<EventSummaryModel[]> {
    return this.getHomePageEvents(force);
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

    // Map audienceZones: API sends audienceZones array directly matching EventAudienceZone
    const audienceZones: EventAudienceZone[] = (apiEvent.audienceZones || []).map((az: any) => ({
      id: az.id,
      name: az.name,
      areaId: az.areaId,
      allocatedCapacity: az.allocatedCapacity,
      isActive: az.isActive,
      seatingType: az.seatingType as SeatingType,
      templateId: az.templateId
    }));

    return {
      id: apiEvent.id,
      name: apiEvent.name,
      categories: apiEvent.categories,
      shortDescription: apiEvent.shortDescription,
      fullDescription: apiEvent.fullDescription,
      tags: apiEvent.tags || [],
      startDate: new Date(apiEvent.startDate),
      endDate: new Date(apiEvent.endDate),
      address: apiEvent.address as StructureAddressModel || this.createEmptyAddress(),
      structure: apiEvent.structure, // Now expecting a StructureSummaryModel object
      areas: (apiEvent.areas || []) as StructureAreaModel[], // Assuming API returns StructureAreaModel like objects
      audienceZones: audienceZones,
      displayOnHomepage: apiEvent.displayOnHomepage || false,
      isFeaturedEvent: apiEvent.featuredEvent || false,
      links: apiEvent.links || [],
      mainPhotoUrl: apiEvent.mainPhotoUrl,
      eventPhotoUrls: apiEvent.eventPhotoUrls || [],
      status: apiEvent.status as EventStatus,
      createdAt: apiEvent.createdAt ? new Date(apiEvent.createdAt) : undefined,
      updatedAt: apiEvent.updatedAt ? new Date(apiEvent.updatedAt) : undefined,
    };
  }

  private mapApiEventToEventSummaryModel(apiEvent: any): EventSummaryModel | undefined {
    if (!apiEvent) return undefined;

    return {
      id: apiEvent.id,
      name: apiEvent.name,
      categories: apiEvent.categories,
      shortDescription: apiEvent.shortDescription,
      startDate: new Date(apiEvent.startDate),
      endDate: new Date(apiEvent.endDate),
      address: apiEvent.address ? {
        city: apiEvent.address.city,
        street: apiEvent.address.street,
        postalCode: apiEvent.address.postalCode,
        country: apiEvent.address.country
      } : { city: apiEvent.city || '' },
      structure: {
        id: apiEvent.structure?.id || apiEvent.structureId,
        name: apiEvent.structure?.name || apiEvent.structureName || ''
      },
      displayOnHomepage: apiEvent.displayOnHomepage || false,
      featuredEvent: apiEvent.featuredEvent || false,
      mainPhotoUrl: apiEvent.mainPhotoUrl,
      status: apiEvent.status as EventStatus,
    };
  }

  private mapApiEventsToEventSummaryModels(apiEvents: any[]): EventSummaryModel[] {
    if (!apiEvents || !Array.isArray(apiEvents)) return [];
    return apiEvents
      .map(apiEvent => this.mapApiEventToEventSummaryModel(apiEvent))
      .filter((event): event is EventSummaryModel => event !== undefined);
  }

  /**
   * Maps `EventDataDto` (from forms) to the DTO format expected by `EventApiService`.
   * @param eventData - The event data from the application (form DTO).
   * @param eventIdForUpdate - Optional: The ID of the event if it's an update operation.
   * @returns The DTO object ready for the API service.
   */
  private mapEventDataDtoToApiDto(eventData: Partial<EventDataDto> | EventDataDto, eventIdForUpdate?: number): any {
    const apiDto: any = { ...eventData }; // Start with a shallow copy

    // Ensure categoryIds is present and in the correct format
    if (eventData.categoryIds && Array.isArray(eventData.categoryIds)) {
      apiDto.categoryIds = eventData.categoryIds;
    } else if (typeof eventData.categoryIds === 'number') { // Handle case where it might be a single number
      apiDto.categoryIds = [eventData.categoryIds];
    }

    // Ensure audienceZones are in the correct format (using EventAudienceZoneConfigDto)
    if (apiDto.audienceZones) {
      apiDto.audienceZones = apiDto.audienceZones.map((zone: EventAudienceZoneConfigDto) => {
        const apiZone: any = {
          templateId: zone.templateId,
          allocatedCapacity: zone.allocatedCapacity
        };
        if (zone.id !== undefined && eventIdForUpdate) { // Only include ID for existing zones during an update
          apiZone.id = zone.id;
        }
        return apiZone;
      });
    }

    // Remove dates if they are not actual Date objects or are null (API might not like null dates)
    if (apiDto.startDate && !(apiDto.startDate instanceof Date)) delete apiDto.startDate;
    if (apiDto.endDate && !(apiDto.endDate instanceof Date)) delete apiDto.endDate;

    // Remove any properties that shouldn't be sent to the API
    delete apiDto.category; // API DTO should not have the 'category' object, only 'categoryIds'
    delete apiDto.categoryId; // Use categoryIds instead

    return apiDto;
  }

  private createEmptyAddress(): StructureAddressModel {
    return { country: '', city: '', street: '', zipCode: '' };
  }

  // --- Utility and Helper Methods ---

  /**
   * Checks if the current user has permission to manage events.
   * Only users with STRUCTURE_ADMINISTRATOR or ORGANIZATION_SERVICE roles can manage events.
   * @returns True if the user has permission, false otherwise.
   */
  hasEventManagementPermission(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    return currentUser.role === UserRole.STRUCTURE_ADMINISTRATOR ||
           currentUser.role === UserRole.ORGANIZATION_SERVICE;
  }

  /**
   * Checks if the current user can edit the given event.
   * User must have event management permission and belong to the structure that created the event.
   * @param event - The event to check.
   * @returns True if the user can edit the event, false otherwise.
   */
  canEditEvent(event: EventModel): boolean {
    if (!event || !event.id) return false;
    if (!this.hasEventManagementPermission()) return false;

    const currentAuthUser = this.authService.currentUser();
    if (!currentAuthUser || !currentAuthUser.structureId) return false; // User not logged in or no structureId

    // User can edit if they belong to the structure that created/hosts the event
    return event.structure.id === currentAuthUser.structureId;
  }

  /**
   * Uploads the main photo for an event.
   * @param eventId - The ID of the event.
   * @param file - The file to upload.
   * @returns An Observable of the upload response.
   */
  uploadMainPhoto(eventId: number, file: File): Observable<FileUploadResponseDto> {
    // Check if user has permission to manage events
    if (!this.hasEventManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour modifier un événement.',
        'error'
      );
      return throwError(() => new Error('Permission denied'));
    }

    return this.eventApi.uploadMainPhoto(eventId, file).pipe(
      tap(response => {
        // Only display notification if there's a message in the response
        if (response && response.message) {
          this.notification.displayNotification(response.message, 'valid');
        } else {
          this.notification.displayNotification('Photo principale téléchargée avec succès', 'valid');
        }
        // Refresh the event details cache if needed
        this.getEventById(eventId, true).subscribe();
      }),
      catchError(error => {
        this.handleError('Impossible de télécharger la photo principale', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Uploads multiple gallery images for an event.
   * @param eventId - The ID of the event.
   * @param files - The array of files to upload.
   * @returns An Observable of the upload responses.
   */
  uploadGalleryImages(eventId: number, files: File[]): Observable<FileUploadResponseDto[]> {
    // Check if user has permission to manage events
    if (!this.hasEventManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour modifier un événement.',
        'error'
      );
      return throwError(() => new Error('Permission denied'));
    }

    return this.eventApi.uploadGalleryImages(eventId, files).pipe(
      tap(responses => {
        this.notification.displayNotification(
          `${responses.length} image(s) de galerie téléchargée(s) avec succès`,
          'valid'
        );
        // Refresh the event details cache if needed
        this.getEventById(eventId, true).subscribe();
      }),
      catchError(error => {
        this.handleError('Impossible de télécharger les images de galerie', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Deletes a gallery image for an event.
   * @param eventId - The ID of the event.
   * @param imagePath - The path of the image to delete.
   * @returns An Observable of void.
   */
  deleteGalleryImage(eventId: number, imagePath: string): Observable<void> {
    // Check if user has permission to manage events
    if (!this.hasEventManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour modifier un événement.',
        'error'
      );
      return throwError(() => new Error('Permission denied'));
    }

    return this.eventApi.deleteGalleryImage(eventId, imagePath).pipe(
      tap(() => {
        this.notification.displayNotification('Image de galerie supprimée avec succès', 'valid');
        // Refresh the event details cache if needed
        this.getEventById(eventId, true).subscribe();
      }),
      catchError(error => {
        this.handleError('Impossible de supprimer l\'image de galerie', error);
        return throwError(() => error);
      })
    );
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
