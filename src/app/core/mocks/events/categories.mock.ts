// src/app/core/mocks/events/categories.mock.ts

import { EventCategory } from '../../models/event.model';

/**
 * Liste des catégories d'événements mockées pour le développement
 */
export const mockCategories = [
  { id: 1, name: 'Music' as EventCategory },
  { id: 2, name: 'Theater' as EventCategory },
  { id: 3, name: 'Sport' as EventCategory },
  { id: 4, name: 'Conference' as EventCategory },
  { id: 5, name: 'Exhibition' as EventCategory },
  { id: 6, name: 'Festival' as EventCategory },
  { id: 7, name: 'Other' as EventCategory }
];

/**
 * Map des catégories par ID pour faciliter la recherche
 */
export const mockCategoriesMap = new Map(
  mockCategories.map(category => [category.id, category.name])
);

/**
 * Map inversée des catégories par nom pour faciliter la recherche
 */
export const mockCategoriesReverseMap = new Map(
  mockCategories.map(category => [category.name, category.id])
);

/**
 * Fonction helper pour obtenir l'ID d'une catégorie à partir de son nom
 */
export function getCategoryId(categoryName: EventCategory): number | undefined {
  return mockCategoriesReverseMap.get(categoryName);
}

/**
 * Fonction helper pour obtenir le nom d'une catégorie à partir de son ID
 */
export function getCategoryName(categoryId: number): EventCategory | undefined {
  return mockCategoriesMap.get(categoryId);
}
