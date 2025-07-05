/**
 * @file Defines the core model for an individual event ticket.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {TicketStatus} from './ticket-status.enum';
import {ParticipantInfoModel} from './participant-info.model';

/**
 * Event snapshot as received from the API
 */
export interface EventSnapshotModel {
  eventId: number;
  name: string;
  startDate: string; // ISO string from API
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  mainPhotoUrl?: string;
}

/**
 * Audience zone snapshot as received from the API
 */
export interface AudienceZoneSnapshotModel {
  audienceZoneId: number;
  name: string;
  seatingType: string;
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
}
