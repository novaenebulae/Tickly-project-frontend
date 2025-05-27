// src/app/core/models/event/event-category.model.ts

/**
 * @file Defines the model for an event category.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Represents a category for an event.
 */
export interface EventCategoryModel {
  /**
   * The unique identifier for the event category.
   */
  id: number;

  /**
   * The name of the event category.
   * @example "Concert", "Théâtre", "Exposition", "Festival"
   */
  name: string;
}
