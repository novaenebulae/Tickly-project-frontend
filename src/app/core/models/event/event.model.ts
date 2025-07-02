/**
 * @file Defines the core model for an event and related DTOs.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { EventCategoryModel } from './event-category.model';
import { EventAudienceZone, SeatingType } from './event-audience-zone.model'; // Updated import
import { StructureAddressModel } from '../structure/structure-address.model'; // Using the renamed AddressModel
import { StructureAreaModel } from '../structure/structure-area.model';
import {StructureSummaryModel} from '../structure/structure-summary.model'; // Using the renamed AreaModel

/**
 * Defines the possible statuses of an event.
 */
// export type EventStatus =
//   | 'draft'     // Event is being prepared, not yet visible to the public.
//   | 'published' // Event is live and visible.
//   | 'pending_approval' // Event is awaiting approval from an admin/moderator.
//   | 'cancelled' // Event has been cancelled.
//   | 'completed'; // Event has finished.

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * Represents an event in the application.
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
   * The category of the event (e.g., concert, theater).
   * This is an object for easy display in the application.
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
   * The ID of the structure (venue) hosting the event.
   */
  structure: number;

  /**
   * Optional list of general physical areas of the host structure
   * where this event will take place.
   * These are `StructureAreaModel` instances.
   */
  areas?: StructureAreaModel[]; // References to physical areas of the structure

  /**
   * Indicates whether the event is free of charge.
   * Ticket prices are not managed in this application.
   */
  isFreeEvent: boolean; // A SUPPRIMER

  /**
   * The default type of seating/placement for this event,
   * can be overridden by specific `EventAudienceZone` configurations.
   */
  defaultSeatingType: SeatingType;

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
 * Data Transfer Object for creating or updating an Event.
 * For updates, most fields are optional. 'id' is not part of this DTO as it's usually in the URL.
 */
export interface EventDataDto {
  name: string;
  /**
   * The ID of the event's category. Sent to the API.
   */
  categoryId: number;
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
  isFreeEvent: boolean; // A SUPPRIMER
  defaultSeatingType: SeatingType;
  /**
   * Audience zones for the event. For creation, `id` within `EventAudienceZone` is omitted.
   * For update, `id` should be present for existing zones to be modified,
   * and omitted for new zones to be added.
   */
  audienceZones: (Omit<EventAudienceZone, 'id'> | EventAudienceZone)[]; // Allows new and existing zones for update
  displayOnHomepage?: boolean;
  isFeaturedEvent?: boolean;
  links?: string[];
  mainPhotoUrl?: string;
  eventPhotoUrls?: string[];
  status?: EventStatus; // Status might be updatable separately or along with other fields
}

export interface EventSummaryModel {
  id: number;
  name: string;
  categories: EventCategoryModel[];
  shortDescription: string;
  startDate: Date; // Garder en string pour le moment, la conversion se fera dans le composant
  endDate: Date;
  city: string;
  structureId: number;
  structureName: string;
  mainPhotoUrl?: string;
  status: EventStatus;
  freeEvent: boolean;
  featuredEvent: boolean;
}
