/**
 * @file Defines the model for participant information associated with a ticket.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Represents the information of the person for whom a ticket is issued.
 */
export interface ParticipantInfoModel {
  /**
   * The first name of the participant.
   */
  firstName: string;

  /**
   * The last name of the participant.
   */
  lastName: string;

  /**
   * The email address of the participant.
   * This might be used for sending ticket confirmations or event updates.
   */
  email: string;
}
