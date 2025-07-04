/**
 * @file Defines the core model for an event and related DTOs.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { EventCategoryModel } from './event-category.model';
import {EventAudienceZone, EventAudienceZoneConfigDto, SeatingType} from './event-audience-zone.model'; // Updated import
import { StructureAddressModel } from '../structure/structure-address.model'; // Using the renamed AddressModel
import { StructureAreaModel } from '../structure/structure-area.model';
import {StructureSummaryModel} from '../structure/structure-summary.model'; // Using the renamed AreaModel

/**
 * Defines the possible statuses of an event.
 */

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Represents an event in the application.
 * Matches the EventDetailResponseDto from the API.
 */
export interface EventModel {
  /**
   * The unique identifier for the event. Optional (not present before creation).
   */
  id?: number;

  /**
   * The name or title of the event.
   */
  name: string;

  /**
   * The categories of the event (e.g., concert, theater).
   * This is an array of objects for easy display in the application.
   */
  categories: EventCategoryModel[];

  /**
   * A short, concise description or tagline for the event.
   */
  shortDescription?: string;

  /**
   * A full, detailed description of the event. Can be lengthy.
   */
  fullDescription: string;

  /**
   * A list of tags or keywords associated with the event for searchability.
   * @example ["rock", "live music", "outdoor"]
   */
  tags?: string[];

  /**
   * The start date and time of the event.
   */
  startDate: Date;

  /**
   * The end date and time of the event.
   */
  endDate: Date;

  /**
   * The physical address where the event takes place.
   */
  address: StructureAddressModel;

  /**
   * The structure (venue) hosting the event.
   */
  structure: StructureSummaryModel;

  /**
   * Optional list of general physical areas of the host structure
   * where this event will take place.
   * These are `StructureAreaModel` instances.
   */
  areas?: StructureAreaModel[]; // References to physical areas of the structure

  /**
   * A list of specific audience zones configured for this event.
   * Each zone defines capacity, placement type, etc., within a `StructureAreaModel`.
   */
  audienceZones: EventAudienceZone[]; // Updated from seatingZones

  /**
   * Indicates whether the event should be displayed on the application's homepage.
   */
  displayOnHomepage: boolean;

  /**
   * Indicates whether the event is a featured or highlighted event.
   */
  isFeaturedEvent: boolean;

  /**
   * Optional list of external links related to the event (e.g., artist website, social media).
   */
  links?: string[];

  /**
   * URL of the main promotional photo or poster for the event.
   */
  mainPhotoUrl?: string;

  /**
   * Optional list of URLs for additional photos or a gallery for the event.
   */
  eventPhotoUrls?: string[];

  /**
   * The current status of the event (e.g., draft, published, cancelled).
   */
  status: EventStatus;

  /**
   * The date and time when the event record was created.
   * Managed by the backend.
   */
  createdAt?: Date;

  /**
   * The date and time when the event record was last updated.
   * Managed by the backend.
   */
  updatedAt?: Date;
}


/**
 * Data Transfer Object for creating an Event.
 * Matches the EventCreationDto from the API.
 */
export interface EventCreationDto {
  name: string;
  /**
   * The IDs of the event's categories. Sent to the API.
   */
  categoryIds: number[];
  shortDescription?: string;
  fullDescription: string;
  tags?: string[];
  startDate: Date;
  endDate: Date;
  address: StructureAddressModel; // Sending the full address object
  structureId: number;
  /**
   * Configuration for audience zones.
   */
  audienceZones: EventAudienceZoneConfigDto[];
  displayOnHomepage: boolean;
  isFeaturedEvent: boolean;
}

/**
 * Data Transfer Object for updating an Event.
 * Matches the EventUpdateDto from the API.
 * For updates, most fields are optional. 'id' is not part of this DTO as it's usually in the URL.
 */
export interface EventUpdateDto {
  name?: string;
  /**
   * The IDs of the event's categories. Sent to the API.
   */
  categoryIds: number[];
  shortDescription?: string;
  fullDescription?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  address?: StructureAddressModel; // Sending the full address object
  /**
   * Configuration for audience zones.
   */
  audienceZones: EventAudienceZoneConfigDto[];
  displayOnHomepage?: boolean;
  isFeaturedEvent?: boolean;
}

/**
 * Data Transfer Object for updating an Event's status.
 * Matches the EventStatusUpdateDto from the API.
 */
export interface EventStatusUpdateDto {
  status: EventStatus;
}

/**
 * Generic Data Transfer Object for creating or updating an Event.
 * Used internally by the application.
 */
export interface EventDataDto {
  name: string;
  /**
   * The IDs of the event's categories. Sent to the API.
   */
  categoryIds: number[];
  shortDescription?: string;
  fullDescription: string;
  tags?: string[];
  startDate: Date;
  endDate: Date;
  address: StructureAddressModel; // Sending the full address object
  structureId: number;
  /**
   * Optional array of IDs of `StructureAreaModel` where the event takes place.
   */
  areaIds?: number[];
  /**
   * Configuration for audience zones.
   */
  audienceZones: EventAudienceZoneConfigDto[];
  displayOnHomepage?: boolean;
  isFeaturedEvent?: boolean;
  links?: string[];
  mainPhotoUrl?: string;
  eventPhotoUrls?: string[];
  status?: EventStatus; // Status might be updatable separately or along with other fields
}

/**
 * Simplified model for event summaries in lists.
 * Based on the API's response format.
 */
export interface EventSummaryModel {
  id: number;
  name: string;
  categories: EventCategoryModel[];
  shortDescription: string;
  startDate: Date;
  endDate: Date;
  address?: {
    city: string;
    street?: string;
    postalCode?: string;
    country?: string;
  };
  structure: {
    id: number;
    name: string;
  };
  mainPhotoUrl?: string;
  status: EventStatus;
  displayOnHomepage: boolean;
  isFeaturedEvent: boolean;
}
