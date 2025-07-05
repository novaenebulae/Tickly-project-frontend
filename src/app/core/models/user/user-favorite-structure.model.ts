import {StructureSummaryModel} from '../structure/structure-summary.model';

/**
 * Represents a user's favorite structure, as returned by the API.
 * Includes the complete structure object.
 */
export interface UserFavoriteStructureModel {
  /**
   * The unique identifier for the favorite structure record.
   */
  id: number;

  /**
   * The ID of the user who favorited the structure.
   */
  userId: number;

  /**
   * The structure object that has been favorited.
   * This is now directly included and not optional.
   */
  structure: StructureSummaryModel;

  /**
   * The date when the structure was added to favorites.
   */
  addedAt: Date;
}

/**
 * Data Transfer Object for adding a structure to favorites.
 */
export interface FavoriteStructureDto {
  /**
   * The ID of the structure to add to favorites.
   */
  structureId: number;
}
