// src/app/core/mocks/events/events.mock.ts

import {EventModel, EventStatus} from '../../models/event/event.model';
import {SeatingType} from '../../models/event/seating.model';
import {EventSearchParams} from '../../models/event/event-search-params.model';
import { allMockEvents } from './eventsMockData';



/**
 * Fonctions utilitaires pour les mocks d'événements
 */

// Récupérer les événements à venir
export function getUpcomingMockEvents(): EventModel[] {
  const today = new Date();
  return allMockEvents.filter(event =>
    new Date(event.startDate) > today &&
    event.status === 'published'
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

// Récupérer les événements pour la page d'accueil
export function getHomepageEvents(count: number = 4): EventModel[] {
  return allMockEvents
    .filter(event => event.displayOnHomepage && event.status === 'published')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, count);
}

// Récupérer les événements mis en avant
export function getFeaturedEvents(count: number = 3): EventModel[] {
  return allMockEvents
    .filter(event => event.isFeaturedEvent && event.status === 'published')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, count);
}

// Récupérer les événements par statut
export function getEventsByStatus(status: EventStatus): EventModel[] {
  return allMockEvents.filter(event => event.status === status);
}

// Récupérer les événements par structure
export function getEventsByStructure(structureId: number): EventModel[] {
  return allMockEvents.filter(event => event.structureId === structureId);
}

// Récupérer les événements par catégorie
export function getEventsByCategory(categoryId: number): EventModel[] {
  return allMockEvents.filter(event => event.category.id === categoryId);
}

// Recherche d'événements par terme
export function searchEvents(term: string): EventModel[] {
  const lowercaseTerm = term.toLowerCase();
  return allMockEvents.filter(event =>
    event.name.toLowerCase().includes(lowercaseTerm) ||
    (event.shortDescription && event.shortDescription.toLowerCase().includes(lowercaseTerm)) ||
    event.fullDescription.toLowerCase().includes(lowercaseTerm) ||
    (event.tags && event.tags.some(tag => tag.toLowerCase().includes(lowercaseTerm)))
  );
}

// Fonctions d'aide supplémentaires pour les mocks d'événements

/**
 * Récupère un événement par son identifiant
 * @param id Identifiant de l'événement à récupérer
 */
export function getMockEventById(id: number): EventModel | undefined {
  return allMockEvents.find(event => event.id === id);
}

/**
 * Récupère les événements par statut pour une structure donnée
 * @param structureId Identifiant de la structure
 * @param status Statut des événements à récupérer
 */
export function getStructureEventsByStatus(structureId: number, status: EventStatus): EventModel[] {
  return allMockEvents.filter(
    event => event.structureId === structureId && event.status === status
  );
}

/**
 * Filtre les événements selon plusieurs critères (utilisé pour la pagination et les filtres)
 * @param filters Critères de filtrage
 * @param page Numéro de la page (commence à 0)
 * @param pageSize Nombre d'éléments par page
 */
export function getFilteredEvents(events: EventModel[], filters: EventSearchParams): EventModel[] {
  console.log('Filtrage des événements avec les critères :', filters);

  return events.filter(event => {
    // Filtre par terme de recherche avec vérification de null/undefined
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const nameMatch = event.name.toLowerCase().includes(query);
      const descMatch = event.shortDescription ? event.shortDescription.toLowerCase().includes(query) : false;
      if (!nameMatch && !descMatch) return false;
    }

    // Filtre par statut
    if (filters.status && event.status !== filters.status) {
      return false;
    }

    // Filtre par mise en avant
    if (filters.featured !== undefined && event.isFeaturedEvent !== filters.featured) {
      return false;
    }

    // Filtre par gratuité
    if (filters.free !== undefined && event.isFreeEvent !== filters.free) {
      return false;
    }

    // Filtre par structure
    if (filters.structureId && event.structureId !== filters.structureId) {
      return false;
    }

    // Filtre par catégorie (tableau)
    if (filters.category) {
      const categoryMatch = filters.category.some(cat => event.category.id === cat.id);
      if (!categoryMatch) return false;
    }

    // Filtre par date avec création unique d'objets Date
    if (filters.startDate) {
      const filterStartDate = new Date(filters.startDate);
      const eventStartDate = new Date(event.startDate);
      if (eventStartDate < filterStartDate) return false;
    }

    if (filters.endDate) {
      const filterEndDate = new Date(filters.endDate);
      const eventEndDate = new Date(event.endDate);
      if (eventEndDate > filterEndDate) return false;
    }

    // Filtre par lieu avec vérification d'existence
    if (filters.location && event.address) {
      const location = filters.location.toLowerCase();
      const cityMatch = event.address.city ? event.address.city.toLowerCase().includes(location) : false;
      const streetMatch = event.address.street ? event.address.street.toLowerCase().includes(location) : false;
      if (!cityMatch && !streetMatch) return false;
    }

    return true;
  }).sort((a, b) => {

    // Gestion du tri
    if (filters.sortBy) {
      const direction = filters.sortDirection === 'desc' ? -1 : 1;

      switch (filters.sortBy) {
        case 'date':
          return direction * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'price':
          // Calculer le prix minimum pour chaque événement
          const aPrice = a.isFreeEvent ? 0 : Math.min(...a.seatingZones.map(z => z.ticketPrice));
          const bPrice = b.isFreeEvent ? 0 : Math.min(...b.seatingZones.map(z => z.ticketPrice));
          return direction * (aPrice - bPrice);
        default:
          return 0;
      }
    }

    // Par défaut, trier par date
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

/**
 * Construit un mock d'événement avec des valeurs par défaut
 * @param overrides Valeurs pour surcharger les valeurs par défaut
 */
export function buildMockEvent(overrides: Partial<EventModel> = {}): EventModel {
  // Valeurs par défaut pour un événement
  const defaultEvent: EventModel = {
    name: 'Événement par défaut',
    category: {id: 7, name: 'Other'},
    fullDescription: 'Description détaillée par défaut pour l\'événement',
    startDate: new Date(new Date().setDate(new Date().getDate() + 30)),  // Dans 30 jours
    endDate: new Date(new Date().setDate(new Date().getDate() + 30 + 2)), // Dans 32 jours (durée 2 jours)
    address: {
      street: 'Rue par défaut',
      city: 'Ville par défaut',
      zipCode: '00000',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 999,
        name: 'Zone par défaut',
        areaId: 999,
        maxCapacity: 100,
        ticketPrice: 10.00,
        isActive: true,
        seatingType: SeatingType.MIXED
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Fusionner les valeurs par défaut avec les overrides
  return {...defaultEvent, ...overrides};
}

/**
 * Génère un ID unique pour un nouvel événement
 */
export function getNextEventId(): number {
  return Math.max(...allMockEvents.map(e => e.id || 0)) + 1;
}

// Export d'objets utilitaires

/**
 * Aide pour le mapping entre les statuts frontend et backend
 */
export const eventStatusMapping = {
  draft: {label: 'Brouillon', color: 'gray'},
  published: {label: 'Publié', color: 'green'},
  pending_approval: {label: 'En attente d\'approbation', color: 'orange'},
  cancelled: {label: 'Annulé', color: 'red'},
  completed: {label: 'Terminé', color: 'blue'}
};

/**
 * Formattage des catégories pour l'affichage
 */
export const eventCategoryMapping: Record<string, { icon: string, color: string }> = {
  'Music': {icon: 'music_note', color: '#3F51B5'}, // Indigo
  'Theater': {icon: 'theater_comedy', color: '#9C27B0'}, // Purple
  'Sport': {icon: 'sports', color: '#00BCD4'}, // Cyan
  'Conference': {icon: 'mic', color: '#FF5722'}, // Deep Orange
  'Exhibition': {icon: 'palette', color: '#FF9800'}, // Orange
  'Festival': {icon: 'festival', color: '#E91E63'}, // Pink
  'Other': {icon: 'event', color: '#607D8B'} // Blue Gray
};

// Version finale pour export
export default {
  allMockEvents,
  getUpcomingMockEvents,
  getHomepageEvents,
  getFeaturedEvents,
  getEventsByStatus,
  getEventsByStructure,
  getEventsByCategory,
  searchEvents,
  getMockEventById,
  getStructureEventsByStatus,
  getFilteredEvents,
  buildMockEvent,
  getNextEventId,
  eventStatusMapping,
  eventCategoryMapping
};
