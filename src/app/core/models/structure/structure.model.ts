// src/app/core/models/structure/structure.model.ts
import {StructureAddressModel} from './structure-address.model';
import {StructureAreaModel} from './structure-area.model';
import {StructureTypeModel} from './structure-type.model';

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

  /**
   * Array of URLs to images in the structure's gallery.
   */
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
  /**
   * The name of the structure.
   * @example "Grand Théâtre de la Ville"
   */
  name: string;

  /**
   * Array of IDs for the structure types.
   */
  typeIds: number[];

  /**
   * A detailed description of the structure.
   */
  description?: string;

  /**
   * The physical address of the structure.
   */
  address: StructureAddressModel;

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
}

/**
 * Data Transfer Object for the response received after creating a new Structure.
 * Based on the API documentation.
 */
export interface StructureCreationResponseDto {
  /**
   * The unique ID of the newly created structure.
   */
  structureId: number;

  /**
   * A success message.
   */
  message: string;

  /**
   * Flag indicating if the frontend should perform a "silent" re-login
   * to get a new JWT that includes the structureId.
   */
  accessToken: string;

  /**
   * The number of seconds until the token expires.
   */
  expiresIn: number;

}

/**
 * Data Transfer Object for updating an existing Structure.
 * All properties are optional for partial updates, allowing for targeted updates of specific fields.
 * 'id' is typically provided via URL parameter and not in the body.
 *
 * This type extends Partial<Omit<StructureCreationDto, 'typeIds'>> to make all properties from StructureCreationDto
 * optional except 'typeIds', which is handled separately to allow it to be optional for updates.
 *
 * Properties inherited from StructureCreationDto:
 * - name: The name of the structure
 * - description: A detailed description of the structure
 * - address: The physical address of the structure
 * - phone: Contact phone number for the structure
 * - email: Contact email address for the structure
 * - websiteUrl: URL of the structure's official website
 * - socialsUrl: Array of URLs to the structure's social media profiles
 * - logoUrl: URL to the structure's logo image
 * - coverUrl: URL to a cover image for the structure
 */
export type StructureUpdateDto = Partial<Omit<StructureCreationDto, 'typeIds'>> & {
  /**
   * Optional array of IDs for the structure types.
   * Only needs to be included if updating the structure's types.
   */
  typeIds?: number[]
};
