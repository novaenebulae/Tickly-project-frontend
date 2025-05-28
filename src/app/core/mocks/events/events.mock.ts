// src/app/core/mocks/events/events.mock.ts
import {EventStatus, EventModel} from '../../models/event/event.model'; // EventModel pour référence de type
import {SeatingType, EventAudienceZone} from '../../models/event/event-audience-zone.model';
import {StructureAddressModel} from '../../models/structure/structure-address.model';
import {StructureAreaModel} from '../../models/structure/structure-area.model'; // Pour event.areas
import {EventCategoryModel} from '../../models/event/event-category.model';
import {EventSearchParams} from '../../models/event/event-search-params.model';
import { allMockEvents } from './data/event-data.mock';

/**
 * Represents the structure of event data as returned by the (mocked) API.
 * Note: Dates are strings (ISO 8601), category is an object.
 * This structure is what EventApiMockService will serve, and EventService will map to EventModel.
 */
export interface MockApiEventDto {
  id: number;
  name: string;
  category: { id: number; name: string }; // Simulating API returning category object
  // categoryId?: number; // Alternative if API returns only ID, EventService would resolve it
  shortDescription?: string;
  fullDescription: string;
  tags?: string[];
  startDate: string; // ISO 8601 string
  endDate: string;   // ISO 8601 string
  address: StructureAddressModel;
  structureId: number;
  areas?: Partial<StructureAreaModel>[]; // Physical areas where event takes place
  isFreeEvent: boolean;
  defaultSeatingType: SeatingType;
  audienceZones: Partial<EventAudienceZone>[]; // Audience zones specific to this event
  displayOnHomepage: boolean;
  isFeaturedEvent: boolean;
  links?: string[];
  mainPhotoUrl?: string;
  eventPhotoUrls?: string[];
  status: EventStatus;
  createdAt: string;  // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
  // Ces champs sont dans notre EventModel mais ne sont pas envoyés par l'API,
  // ils sont calculés/ajoutés par le backend ou sont des concepts frontend.
  // Donc, ils ne devraient pas être dans le mock API DTO.
  // eventsCount?: number;
  // importance?: number;
}

/**
 * Interface for internal filter parameters used by getFilteredEvents.
 * This aligns with how EventApiMockService prepares the filters.
 */
export interface MockEventFilters {
  query?: string;
  categoryIds?: number[]; // <<< Changement principal ici
  startDate?: Date | string; // Peut être Date ou string ISO
  endDate?: Date | string;
  free?: boolean;
  status?: EventStatus;
  displayOnHomepage?: boolean;
  isFeaturedEvent?: boolean;
  structureId?: number;
  location?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  tags?: string[];
  genres?: string[]; // Conserver si utilisé
  withPhotos?: boolean;
}


// --- Fonctions Utilitaires pour les Mocks ---

let nextEventId = allMockEvents.length > 0 ? Math.max(...allMockEvents.map(e => e.id)) + 1 : 1;

export function getNextEventId(): number {
  return nextEventId++;
}

export function getMockEventById(id: number): MockApiEventDto | undefined {
  return allMockEvents.find(event => event.id === id);
}

// Modifiez la signature de getFilteredEvents
export function getFilteredEvents(allEvents: MockApiEventDto[], filters: Partial<MockEventFilters>): MockApiEventDto[] {
  let results = [...allEvents];

  if (filters.query) {
    const query = filters.query.toLowerCase();
    results = results.filter(event =>
      event.name.toLowerCase().includes(query) ||
      (event.shortDescription && event.shortDescription.toLowerCase().includes(query)) ||
      (event.fullDescription && event.fullDescription.toLowerCase().includes(query)) ||
      (event.tags && event.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }

  // Le filtrage par categoryIds fonctionnera maintenant sans erreur de type
  if (filters.categoryIds && Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0) {
    results = results.filter(event => filters.categoryIds!.includes(event.category.id));
  }

  if (filters.startDate) {
    // Convertir en Date pour la comparaison, car filters.startDate peut être string ou Date
    const filterStartDate = new Date(filters.startDate);
    results = results.filter(event => new Date(event.startDate) >= filterStartDate);
  }

  if (filters.endDate) {
    const filterEndDate = new Date(filters.endDate);
    results = results.filter(event => new Date(event.endDate) <= filterEndDate);
  }

  if (filters.free !== undefined) {
    results = results.filter(event => event.isFreeEvent === filters.free);
  }
  if (filters.status) {
    results = results.filter(event => event.status === filters.status);
  }
  if (filters.displayOnHomepage !== undefined) {
    results = results.filter(event => event.displayOnHomepage === filters.displayOnHomepage);
  }
  if (filters.isFeaturedEvent !== undefined) {
    results = results.filter(event => event.isFeaturedEvent === filters.isFeaturedEvent);
  }
  if (filters.structureId !== undefined) {
    results = results.filter(event => event.structureId === filters.structureId);
  }
  if (filters.location) {
    const locationQuery = filters.location.toLowerCase();
    results = results.filter(event =>
      event.address.city.toLowerCase().includes(locationQuery) ||
      event.address.street.toLowerCase().includes(locationQuery) ||
      event.address.country.toLowerCase().includes(locationQuery) ||
      (event.address.zipCode && event.address.zipCode.includes(locationQuery))
    );
  }
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(event =>
      event.tags && filters.tags!.every(tag => event.tags!.includes(tag))
    );
  }
  if (filters.withPhotos) {
    results = results.filter(event => event.mainPhotoUrl || (event.eventPhotoUrls && event.eventPhotoUrls.length > 0));
  }

  // Tri
  if (filters.sortBy) {
    results.sort((a, b) => {
      let valA = (a as any)[filters.sortBy!];
      let valB = (b as any)[filters.sortBy!];
      if (filters.sortBy === 'startDate' || filters.sortBy === 'endDate' || filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      }
      if (valA < valB) return filters.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return filters.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  if (filters.page !== undefined && filters.pageSize !== undefined) {
    const start = filters.page * filters.pageSize;
    results = results.slice(start, start + filters.pageSize);
  }

  return results;
}
