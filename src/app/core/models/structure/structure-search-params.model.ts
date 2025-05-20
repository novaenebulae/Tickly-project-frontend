// src/app/core/models/structure/structure-search-params.model.ts
export interface StructureSearchParams {
  query?: string;                        // Recherche textuelle
  types?: number[];                      // IDs des types de structure
  location?: string;                     // Localisation géographique
  sortBy?: string;                       // Champ pour le tri
  sortDirection?: 'asc' | 'desc';        // Direction du tri
  page?: number;                         // Pagination
  pageSize?: number;                     // Taille de la page
}
