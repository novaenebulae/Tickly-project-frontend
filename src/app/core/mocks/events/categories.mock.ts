// src/app/core/mocks/events/categories.mock.ts

import { EventCategoryModel } from '../../models/event/event-category.model';
import {allMockEvents} from './data/event-data.mock';

/**
 * Liste des catégories d'événements mockées pour le développement
 */
// La méthode Set ne fonctionne pas avec des objets car elle compare les références, pas les valeurs
// Cette méthode utilise un Map pour dédupliquer par ID de catégorie
export const mockCategories: EventCategoryModel[] = Array.from(
  // Créer un Map temporaire avec l'ID comme clé pour éliminer les doublons
  allMockEvents
    .reduce((map, event) => {
      if (event.category && event.category.id) {
        map.set(event.category.id, event.category);
      }
      return map;
    }, new Map<number, EventCategoryModel>())
    .values()
);

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
