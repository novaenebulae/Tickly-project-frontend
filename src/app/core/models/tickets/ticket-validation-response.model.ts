/**
 * @file Defines the core model for an individual event ticket.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {TicketStatus} from './ticket-status.enum';
import {ParticipantInfoModel} from './participant-info.model';

/**
 * Represents an individual event ticket as received from the API
 */
export interface TicketValidationResponseModel {
  /**
   * The unique identifier for the ticket (e.g., a UUID).
   */
  id: string;

  /**
   * The data to be encoded into the QR code for scanning.
   */
  ticketId: string;

  /**
   * The current status of the ticket.
   */
  status: TicketStatus;

  message: String;

  /**
   * Information about the participant for whom this ticket is issued.
   */
  participant: ParticipantInfoModel;

  validatedAt: Date;

}
