import {StructureTypeModel} from './structure-type.model';

/**
 * Represents a summary of a structure, used in lists and favorites.
 * This is the frontend equivalent of `StructureSummaryDto`.
 */
export interface StructureSummaryModel {
  /**
   * The unique identifier for the structure.
   */
  id: number;

  /**
   * The name of the structure.
   */
  name: string;

  /**
   * The types/categories of the structure.
   */
  types: StructureTypeModel[];

  /**
   * The city where the structure is located.
   */
  city: string;

  /**
   * URL to the structure's logo image. Optional.
   */
  logoUrl?: string;

  /**
   * URL to the structure's cover image. Optional.
   */
  coverUrl?: string;

  /**
   * Indicates if the structure is currently active.
   */
  isActive: boolean;

  /**
   * The number of events associated with this structure. Optional.
   */
  eventCount?: number;
}
