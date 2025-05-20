/**
 * Interface pour les paramètres de recherche de structures
 */
export interface StructureSearchParams {
  query?: string;
  typeIds?: number[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  minImportance?: number;
  maxImportance?: number;
  location?: string;
  types?: number[];
}
