/**
 * @file Defines models related to the ticket reservation process.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {ParticipantInfoModel} from './participant-info.model';
import {TicketModel} from './ticket.model';

/**
 * Data Transfer Object for creating a new reservation (a request for one or more tickets).
 * This is what the user submits from the frontend.
 * All tickets in this request must be for the same audience zone.
 */
export interface ReservationRequestDto {
  /**
   * The ID of the event for which the reservation is being made.
   */
  eventId: number;

  /**
   * The ID of the `EventAudienceZone` selected by the user for all tickets in this request.
   */
  audienceZoneId: number;

  /**
   * An array of participant information. The length of this array determines the number of tickets
   * requested (1 to 4 participants as per requirements). Each participant will receive one ticket
   * for the specified `audienceZoneId`.
   */
  participants: ParticipantInfoModel[]; // Length should be between 1 and 4

  /**
   * Optional ID of the user making the reservation, if authenticated.
   * The backend might also infer this from the authentication token.
   */
  userId?: number;
}

/**
 * Represents a confirmed reservation, which typically results in one or more tickets being issued.
 * This could be what the API returns after a successful reservation request.
 */
export interface ReservationConfirmationModel {
  /**
   * A unique identifier for this reservation batch, if the backend generates one.
   * e.g., a group booking reference.
   */
  reservationId: string;

  /**
   * The ID of the event.
   */
  eventId: number;

  /**
   * The list of individual tickets that were successfully issued as part of this reservation.
   */
  tickets: TicketModel[];

  /**
   * The date and time when this reservation was confirmed and tickets were issued.
   */
  reservationDate: Date;
}

/**
 * Data Transfer Object for preparing data needed to generate a PDF for a ticket.
 * The TicketingService would populate this to be consumed by a PDF generation utility.
 */
export interface TicketPdfDataDto extends TicketModel {
  /**
   * Name of the structure/venue hosting the event.
   */
  structureName?: string;

  /**
   * Logo URL of the structure/venue or event organizer.
   */
  organizerLogoUrl?: string;

  /**
   * Any specific terms and conditions to display on the ticket PDF.
   */
  termsAndConditions?: string;
}
