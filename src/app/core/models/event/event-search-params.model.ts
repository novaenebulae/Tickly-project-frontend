// src/app/core/models/event/event-search-params.model.ts

/**
 * @file Defines the model for event search parameters.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { EventCategoryModel } from './event-category.model';
import { EventStatus } from './event.model';

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
  category?: EventCategoryModel[];

  /**
   * The minimum start date for events (inclusive).
   */
  startDate?: Date;

  /**
   * The maximum end date for events (inclusive).
   */
  endDate?: Date;

  /**
   * Filter for free events only if set to true.
   * If false or undefined, includes both free and non-free (though price isn't managed).
   */
  free?: boolean;

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
  isFeaturedEvent?: boolean; // Renamed from 'featured' for consistency with EventModel

  /**
   * Filter events by the ID of the hosting structure.
   */
  structureId?: number;

  /**
   * A text query for location-based search (e.g., city, region).
   */
  location?: string;

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

  /**
   * Filter events by an array of genres.
   * This field was present in your original EventCreationDto and kept here for search consistency if needed.
   * If 'tags' are sufficient, this can be removed.
   */
  genres?: string[];

  /**
   * Filter events that have at least one photo associated.
   */
  withPhotos?: boolean;
}
