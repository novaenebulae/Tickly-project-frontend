/**
 * @file Defines the core model for an individual event ticket.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {TicketStatus} from './ticket-status.enum';
import {ParticipantInfoModel} from './participant-info.model';

/**
 * Event snapshot as received from the API.
 * Contains essential event information that is stored with the ticket.
 */
export interface EventSnapshotModel {
  /**
   * The unique identifier of the event.
   */
  eventId: number;

  /**
   * The name or title of the event.
   */
  name: string;

  /**
   * The start date and time of the event as an ISO string.
   */
  startDate: string; // ISO string from API

  /**
   * The physical address where the event takes place.
   */
  address: {
    /**
     * The street name and number.
     */
    street: string;

    /**
     * The city of the address.
     */
    city: string;

    /**
     * The postal code or zip code.
     */
    zipCode: string;

    /**
     * The country of the address.
     */
    country: string;
  };

  /**
   * URL of the main promotional photo or poster for the event.
   */
  mainPhotoUrl?: string;
}

/**
 * Audience zone snapshot as received from the API.
 * Contains essential information about the audience zone that is stored with the ticket.
 */
export interface AudienceZoneSnapshotModel {
  /**
   * The unique identifier of the audience zone.
   */
  audienceZoneId: number;

  /**
   * The name of the audience zone.
   * @example "Fosse Or", "Balcon Rangée A", "Zone Debout Scène Gauche"
   */
  name: string;

  /**
   * The type of seating or placement offered in this zone.
   * @example "SEATED", "STANDING", "MIXED"
   */
  seatingType: string;
}

export interface StructureSnapshotModel {
  id: number;
  name: string;
  logoUrl?: string;

}

/**
 * Represents an individual event ticket as received from the API
 */
export interface TicketModel {
  /**
   * The unique identifier for the ticket (e.g., a UUID).
   */
  id: string;

  /**
   * The data to be encoded into the QR code for scanning.
   */
  qrCodeValue: string;

  /**
   * The current status of the ticket.
   */
  status: TicketStatus;

  validatedAt?: Date;

  /**
   * Information about the participant for whom this ticket is issued.
   */
  participant: ParticipantInfoModel;

  /**
   * A snapshot of key event details at the time of booking.
   */
  eventSnapshot: EventSnapshotModel;

  /**
   * A snapshot of key audience zone details at the time of booking.
   */
  audienceZoneSnapshot: AudienceZoneSnapshotModel;

  structureSnapshot: StructureSnapshotModel;

}
