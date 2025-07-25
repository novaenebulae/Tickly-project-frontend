// src/app/core/models/tickets/ticket-status.enum.ts

/**
 * @file Defines the enum for ticket statuses.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Defines the possible statuses of a ticket.
 */
export enum TicketStatus {
  /**
   * The ticket has been successfully issued and is valid for entry.
   */
  VALID = 'VALID',

  /**
   * The ticket has been scanned and used for entry.
   */
  USED = 'USED',

  /**
   * The ticket has been cancelled (e.g., by an admin or by the user if allowed).
   */
  CANCELLED = 'CANCELLED',

  /**
   * The ticket has expired (e.g., event date has passed and it wasn't used).
   * This status might be set by a background process or upon validation check.
   */
  EXPIRED = 'EXPIRED'
}
