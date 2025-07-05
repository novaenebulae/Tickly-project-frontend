// src/app/core/models/event/event-search-params.model.ts

/**
 * @file Defines the model for event search parameters.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {EventStatus} from './event.model';

/**
 * Interface for defining filters and parameters for searching events.
 */
export interface EventSearchParams {
  /**
   * A general text query to search in event names, descriptions, tags, etc.
   */
  query?: string;

  /**
   * An array of `EventCategoryModel` objects to filter by.
   * The backend service will typically extract IDs from these objects for querying.
   * An event must match at least one of the specified categories.
   */
  categoryIds?: number[];

  /**
   * The minimum start date for events (inclusive).
   */
  startDateAfter?: Date;

  /**
   * The maximum end date for events (inclusive).
   */
  startDateBefore?: Date;

  /**
   * Filter events by their current status.
   */
  status?: EventStatus;

  /**
   * Filter events that are marked for display on the homepage.
   */
  displayOnHomepage?: boolean;

  /**
   * Filter events that are marked as featured.
   */
  isFeatured?: boolean; // Renamed from 'featured' for consistency with EventModel

  /**
   * Filter events by the ID of the hosting structure.
   */
  structureId?: number;

  /**
   * A text query for location-based search (e.g., city, region).
   */
  city?: string;

  /**
   * The page number for pagination (0-indexed or 1-indexed depending on API).
   */
  page?: number;

  /**
   * The number of events to return per page.
   */
  pageSize?: number;

  /**
   * The field to sort the event results by.
   * @example "name", "startDate", "createdAt"
   */
  sortBy?: string;

  /**
   * The direction for sorting.
   */
  sortDirection?: 'asc' | 'desc';

  /**
   * Filter events by an array of tags. Event must match all or any depending on backend logic.
   */
  tags?: string[];

}
