// src/app/core/models/event/event-search-params.model.ts
import { EventCategoryModel } from './event-category.model';
import { EventStatus } from './event.model';

/**
 * Interface pour les filtres de recherche d'événements
 */
export interface EventSearchParams {
  query?: string;             // Recherche textuelle
  category?: number | EventCategoryModel;          // ID de la catégorie (modifié)
  categoryId?: number;        // Alternative pour l'ID de catégorie (ajouté pour compatibilité)
  startDate?: Date;           // Date de début minimum
  endDate?: Date;             // Date de fin maximum
  free?: boolean;             // Événements gratuits seulement
  status?: EventStatus;       // Filtrer par statut
  structureId?: number;       // Filtrer par structure organisatrice
  featured?: boolean;         // Événements mis en avant seulement
  page?: number;              // Numéro de page (pagination)
  pageSize?: number;          // Taille de la page (pagination)
  sortBy?: string;            // Champ de tri
  sortDirection?: 'asc' | 'desc'; // Direction du tri
}
