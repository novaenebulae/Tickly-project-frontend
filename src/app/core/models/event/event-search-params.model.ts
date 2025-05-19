// src/app/core/models/event/event-search-params.model.ts
import { EventCategoryModel } from './event-category.model';
import { EventStatus } from './event.model';

/**
 * Interface pour les filtres de recherche d'événements
 */
export interface EventSearchParams {
  query?: string;                         // Recherche textuelle
  category?: number | EventCategoryModel; // Catégorie (ID ou objet complet)
  categoryId?: number;                    // Alternative pour l'ID de catégorie

  // Dates
  startDate?: Date;                       // Date de début minimum
  endDate?: Date;                         // Date de fin maximum

  // Paramètres de visibilité et statut
  free?: boolean;                         // Événements gratuits seulement
  status?: EventStatus;                   // Filtrer par statut
  displayOnHomepage?: boolean;            // Événements à afficher sur la page d'accueil
  featured?: boolean;                     // Événements mis en avant

  // Filtre par structure
  structureId?: number;                   // Filtrer par structure organisatrice
  location?: string;

  // Pagination
  page?: number;                          // Numéro de page
  pageSize?: number;                      // Taille de la page

  // Tri
  sortBy?: string;                        // Champ de tri
  sortDirection?: 'asc' | 'desc';         // Direction du tri

  // Filtres supplémentaires
  tags?: string[];                        // Filtrer par tags
  genres?: string[];                      // Filtrer par genres (valeurs exactes fournies par le backend)
  withPhotos?: boolean;                   // Événements avec photos uniquement
}
