// src/app/core/models/structure/structure.model.ts
import { StructureAddressModel } from './structure-address.model';
import { StructureAreaModel } from './structure-area.model';
import { StructureTypeModel } from './structure-type.model';

/**
 * Represents a physical structure or venue.
 */
export interface StructureModel {
  /**
   * The unique identifier for the structure.
   * Optional as it's not present before creation.
   */
  id?: number;

  /**
   * The name of the structure.
   * @example "Grand Théâtre de la Ville"
   */
  name: string;

  /**
   * A list of types or categories this structure belongs to.
   */
  types: StructureTypeModel[];

  /**
   * A detailed description of the structure.
   */
  description?: string;

  /**
   * The physical address of the structure.
   */
  address: StructureAddressModel;

  /**
   * Optional list of physical areas defined within this structure.
   */
  areas?: StructureAreaModel[];

  /**
   * Contact phone number for the structure.
   */
  phone?: string;

  /**
   * Contact email address for the structure.
   */
  email?: string;

  /**
   * URL of the structure's official website.
   */
  websiteUrl?: string;

  /**
   * Array of URLs to the structure's social media profiles.
   */
  socialsUrl?: string[];

  /**
   * URL to the structure's logo image.
   */
  logoUrl?: string;

  /**
   * URL to a cover image for the structure.
   */
  coverUrl?: string;

  galleryImageUrls?: string[];

  /**
   * The date and time when the structure was created.
   * Managed by the backend.
   */
  createdAt: Date; // Assuming API always returns it for existing structures

  /**
   * The date and time when the structure was last updated.
   * Managed by the backend.
   */
  updatedAt?: Date;

  /**
   * An optional metric representing the importance or ranking of the structure.
   */
  importance?: number;

  /**
   * The count of events associated with this structure.
   * Typically provided by the backend.
   */
  eventsCount?: number; // Made optional as it might not always be present
}

/**
 * Data Transfer Object for creating a new Structure.
 */
export interface StructureCreationDto {
  name: string;
  /**
   * Array of IDs for the structure types.
   */
  typeIds: number[];
  description?: string;
  address: StructureAddressModel;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  socialsUrl?: string[];
  logoUrl?: string;
  coverUrl?: string;
}

/**
 * Data Transfer Object for the response received after creating a new Structure.
 * It typically includes the newly created structure and potentially an updated authentication token.
 */
export interface StructureCreationResponseDto {
  /**
   * A new JWT token, possibly granted if creating a structure completes user setup.
   */
  newToken: string;
  /**
   * The structure entity that was successfully created.
   */
  createdStructure?: StructureModel; // API might return the created object
}

/**
 * Data Transfer Object for updating an existing Structure.
 * All properties are optional for partial updates.
 * 'id' is typically provided via URL parameter and not in the body.
 */
export type StructureUpdateDto = Partial<Omit<StructureCreationDto, 'typeIds'>> & { typeIds?: number[] };
// For update, typeIds might be optional if not changing types.
// Omit 'id' and other non-updatable fields like createdAt, eventsCount, importance from the DTO if they are never sent.
