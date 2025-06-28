/**
 * @file Provides mock implementations for the Event API service methods.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ApiConfigService } from '../api-config.service';
import { EventStatus } from '../../../models/event/event.model';
import { EventSearchParams } from '../../../models/event/event-search-params.model';

import {
  getMockEventById,
  getFilteredEvents,
  getNextEventId,
  addMockEvent,
  updateMockEvent
} from '../../../mocks/events/events.mock';
import { mockCategories } from '../../../mocks/events/categories.mock';
import { allMockEvents } from '../../../mocks/events/data/event-data.mock';

@Injectable({
  providedIn: 'root'
})
export class EventApiMockService {
  private apiConfig = inject(ApiConfigService);

  // Clés pour le stockage localStorage
  private readonly MOCK_EVENTS_STORAGE_KEY = 'events';

  constructor() {
    // Initialiser les données depuis localStorage
    this.initializeMockData();
  }

  /**
   * Initialise les données mock depuis localStorage.
   */
  private initializeMockData(): void {
    // Charger les événements depuis localStorage
    const storedEvents = this.apiConfig.loadMockDataFromStorage(this.MOCK_EVENTS_STORAGE_KEY, allMockEvents);

    // Synchroniser avec le tableau global allMockEvents
    allMockEvents.length = 0; // Vider le tableau
    allMockEvents.push(...storedEvents); // Ajouter les données du storage

    // Mettre à jour nextEventId pour qu'il soit supérieur à tous les IDs existants
    if (allMockEvents.length > 0) {
      const maxId = Math.max(...allMockEvents.map(e => e.id));
      // Mettre à jour la variable nextEventId dans events.mock.ts
      // en utilisant une approche indirecte puisque c'est une variable externe
      getNextEventId(); // Appel fictif pour accéder à la closure
      // Cette logique sera gérée par la fonction getNextEventId elle-même
    }
  }

  /**
   * Sauvegarde les événements dans localStorage.
   */
  private saveMockEvents(): void {
    this.apiConfig.saveMockDataToStorage(this.MOCK_EVENTS_STORAGE_KEY, allMockEvents);
  }

  // mockGetEvents(params: EventSearchParams): Observable<any[]> {
  //   this.apiConfig.logApiRequest('MOCK GET', 'events', params);
  //   let filters: any = { ...params };
  //   if (params.category && Array.isArray(params.category)) {
  //     filters = { ...filters, categoryIds: params.category.map(c => c.id) };
  //     delete filters.category;
  //   }
  //   // getFilteredEvents should expect 'audienceZones' in allMockEvents if that's our API contract
  //   const filteredApiEvents = getFilteredEvents(allMockEvents, filters);
  //   return this.apiConfig.createMockResponse(filteredApiEvents);
  // }

  // mockSearchEvents(params: EventSearchParams): Observable<any[]> {
  //   this.apiConfig.logApiRequest('MOCK GET', 'search-events', params);
  //   return this.mockGetEvents(params);
  // }

  mockGetEventById(id: number): Observable<any> {
    this.apiConfig.logApiRequest('MOCK GET', `event/${id}`, null);
    // getMockEventById should return a DTO with 'audienceZones' and 'category' as object
    const apiEventDto = getMockEventById(id);
    if (!apiEventDto) {
      return this.apiConfig.createMockError(404, 'Mock Event not found');
    }
    return this.apiConfig.createMockResponse(apiEventDto);
  }

  mockCreateEvent(eventApiDto: any): Observable<any> {
    this.apiConfig.logApiRequest('MOCK POST', 'create-event', eventApiDto);
    // eventApiDto for creation comes from EventService, which prepares it with categoryId
    // and audienceZones (without ids in the zones themselves).
    if (!eventApiDto.name || !eventApiDto.fullDescription || !eventApiDto.startDate || !eventApiDto.endDate || eventApiDto.categoryId === undefined) {
      return this.apiConfig.createMockError(400, 'Mock: Missing required event information for creation.');
    }

    const newId = getNextEventId();
    const categoryForResponse = mockCategories.find(c => c.id === eventApiDto.categoryId)
      || { id: eventApiDto.categoryId, name: `Category ${eventApiDto.categoryId}` }; // Fallback

    // The mock API response should have 'category' as an object and 'audienceZones'
    const newApiEventResponse = {
      id: newId,
      name: eventApiDto.name,
      category: { id: categoryForResponse.id, name: categoryForResponse.name }, // API returns category object
      shortDescription: eventApiDto.shortDescription,
      fullDescription: eventApiDto.fullDescription,
      tags: eventApiDto.tags,
      startDate: eventApiDto.startDate,
      endDate: eventApiDto.endDate,
      address: eventApiDto.address || {
        street: '',
        city: '',
        zipCode: '',
        country: 'France'
      },
      structureId: eventApiDto.structureId,
      areas: eventApiDto.areas,
      isFreeEvent: eventApiDto.isFreeEvent,
      defaultSeatingType: eventApiDto.defaultSeatingType,
      // API returns 'audienceZones' with generated IDs for each zone
      audienceZones: (eventApiDto.audienceZones || []).map((zone: any, index: number) => ({
        id: newId * 1000 + index + 1, // Simulate backend ID generation for zones
        name: zone.name,
        areaId: zone.areaId,
        maxCapacity: zone.maxCapacity,
        isActive: zone.isActive,
        seatingType: zone.seatingType,
        // No ticketPrice, rowCount, seatsPerRow here
      })),
      displayOnHomepage: eventApiDto.displayOnHomepage,
      isFeaturedEvent: eventApiDto.isFeaturedEvent,
      links: eventApiDto.links,
      mainPhotoUrl: eventApiDto.mainPhotoUrl,
      eventPhotoUrls: eventApiDto.eventPhotoUrls,
      status: EventStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Important : ajouter l'événement à la liste des événements mockés
    addMockEvent(newApiEventResponse);
    // Sauvegarder dans localStorage
    this.saveMockEvents();

    return this.apiConfig.createMockResponse(newApiEventResponse);
  }

  mockUpdateEvent(id: number, eventApiDto: Partial<any>): Observable<any> {
    this.apiConfig.logApiRequest('MOCK PUT', `update-event/${id}`, eventApiDto);
    // existingApiEventDto should be a full API DTO, including 'audienceZones' and 'category' object
    const existingApiEventDto = getMockEventById(id);
    if (!existingApiEventDto) {
      return this.apiConfig.createMockError(404, 'Mock Event not found for update');
    }

    // Start with the existing event and apply partial updates
    const updatedApiEventDto = {
      ...existingApiEventDto,
      ...eventApiDto, // Apply changes from eventApiDto
      updatedAt: new Date().toISOString()
    };

    // If eventApiDto contains categoryId, transform it into a category object for the response
    if (eventApiDto['categoryId'] !== undefined) {
      const categoryForResponse = mockCategories.find(c => c.id === eventApiDto['categoryId'])
        || { id: eventApiDto['categoryId'], name: `Category ${eventApiDto['categoryId']}` };
      updatedApiEventDto.category = { id: categoryForResponse.id, name: categoryForResponse.name };
      // If eventApiDto itself had a 'category' object, it would have been overwritten by the spread.
      // If categoryId was the field sent for update, ensure it's not in the final response object
      // if 'category' object is now present.
      // delete updatedApiEventDto.categoryId; // Only if 'categoryId' was a field in existingApiEventDto or eventApiDto
    }

    // If eventApiDto contains audienceZones, it replaces the existing audienceZones
    // The mock should simulate what the API returns.
    if (eventApiDto['audienceZones']) {
      updatedApiEventDto.audienceZones = (eventApiDto['audienceZones']).map((zone: any, index: number) => ({
        id: zone.id || (id * 1000 + index + 1), // Keep existing ID or generate for new zones in update
        name: zone.name,
        areaId: zone.areaId,
        maxCapacity: zone.maxCapacity,
        isActive: zone.isActive,
        seatingType: zone.seatingType,
      }));
    }

    // Important : mettre à jour l'événement dans la liste des événements mockés
    updateMockEvent(id, updatedApiEventDto);
    // Sauvegarder dans localStorage
    this.saveMockEvents();

    return this.apiConfig.createMockResponse(updatedApiEventDto);
  }

  mockDeleteEvent(id: number): Observable<void> {
    this.apiConfig.logApiRequest('MOCK DELETE', `delete-event/${id}`, null);
    const existingEvent = getMockEventById(id);
    if (!existingEvent) {
      return this.apiConfig.createMockError(404, 'Mock Event not found for deletion');
    }

    // Supprimer l'événement de la liste des événements mockés
    const index = allMockEvents.findIndex(event => event.id === id);
    if (index !== -1) {
      allMockEvents.splice(index, 1);
    }
    // Sauvegarder dans localStorage
    this.saveMockEvents();

    return this.apiConfig.createMockResponse(undefined as void);
  }

  mockGetEventCategories(): Observable<any[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'event-categories', null);
    // mockCategories is an array of {id: number, name: string}
    return this.apiConfig.createMockResponse(mockCategories);
  }

  mockUpdateEventStatus(id: number, status: EventStatus): Observable<any> {
    this.apiConfig.logApiRequest('MOCK PATCH', `update-event-status/${id}`, { status });
    const existingApiEventDto = getMockEventById(id);
    if (!existingApiEventDto) {
      return this.apiConfig.createMockError(404, 'Mock Event not found for status update');
    }
    const updatedApiEventDto = {
      ...existingApiEventDto,
      status: status,
      updatedAt: new Date().toISOString()
    };

    // Important : mettre à jour le statut de l'événement dans la liste des événements mockés
    updateMockEvent(id, { status, updatedAt: new Date().toISOString() });
    // Sauvegarder dans localStorage
    this.saveMockEvents();

    return this.apiConfig.createMockResponse(updatedApiEventDto);
  }
}
