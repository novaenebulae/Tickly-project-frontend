// src/app/core/mocks/events/categories.mock.ts

import { EventCategoryModel } from '../../models/event/event-category.model';

/**
 * Liste des catégories d'événements mockées pour le développement
 */
export const mockCategories: EventCategoryModel[] = [
  { id: 1, name: 'Music' },
  { id: 2, name: 'Theater' },
  { id: 3, name: 'Sport' },
  { id: 4, name: 'Conference' },
  { id: 5, name: 'Exhibition' },
  { id: 6, name: 'Festival' },
  { id: 7, name: 'Other' }
];

/**
 * Map des catégories par ID pour faciliter la recherche
 */
export const mockCategoriesMap = new Map<number, EventCategoryModel>(
  mockCategories.map(category => [category.id, category])
);

/**
 * Map inversée des catégories par nom pour faciliter la recherche
 */
export const mockCategoriesReverseMap = new Map<string, number>(
  mockCategories.map(category => [category.name, category.id])
);

/**
 * Fonction helper pour obtenir l'ID d'une catégorie à partir de son nom
 */
export function getCategoryIdByName(categoryName: string): number | undefined {
  return mockCategoriesReverseMap.get(categoryName);
}

/**
 * Fonction helper pour obtenir une catégorie à partir de son ID
 */
export function getCategoryById(categoryId: number): EventCategoryModel | undefined {
  return mockCategoriesMap.get(categoryId);
}

/**
 * Fonction helper pour obtenir une catégorie à partir de son nom
 */
export function getCategoryByName(categoryName: string): EventCategoryModel | undefined {
  const categoryId = getCategoryIdByName(categoryName);
  return categoryId ? mockCategoriesMap.get(categoryId) : undefined;
}
