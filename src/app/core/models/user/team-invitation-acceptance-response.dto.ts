/**
 * @file Model for the team invitation acceptance response.
 * @licence Proprietary
 */

/**
 * API response when accepting a team invitation.
 */
export interface TeamInvitationAcceptanceResponseDto {
  /**
   * The new JWT token with updated information.
   */
  accessToken: string;

  /**
   * Token validity duration in milliseconds.
   */
  expiresIn: number;

  /**
   * ID of the structure to which the user has been added.
   */
  structureId: number;

  /**
   * Name of the structure.
   */
  structureName: string;

  /**
   * Confirmation message.
   */
  message: string;
}
