// src/app/core/models/structure/structure-search-params.model.ts

/**
 * Defines the parameters that can be used to search for structures.
 */
export interface StructureSearchParams {
  /**
   * A general text query to search in structure names, descriptions, etc.
   */
  query?: string;

  /**
   * An array of structure type IDs to filter by.
   * The structure must match at least one of these types.
   */
  typeIds?: number[];

  /**
   * The page number for pagination (0-indexed).
   */
  page?: number;

  /**
   * The number of items per page for pagination.
   */
  pageSize?: number;

  /**
   * The field to sort the results by.
   * @example "name", "importance", "createdAt"
   */
  sortBy?: string; // e.g., 'name', 'importance', 'createdAt'

  /**
   * The direction of sorting.
   */
  sortDirection?: 'asc' | 'desc';

  /**
   * Minimum importance score for filtering.
   */
  minImportance?: number;

  /**
   * Maximum importance score for filtering.
   */
  maxImportance?: number;

  /**
   * A text query to search by location (city, country, zip code).
   */
  location?: string;

  // 'types?: number[];' was redundant with 'typeIds' and has been removed.
}
