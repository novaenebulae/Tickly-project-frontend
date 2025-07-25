/**
 * @file Defines the DTO for representing a friend who is also a participant in an event.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Data Transfer Object that represents a friend of the current user
 * who is also participating in a specific event.
 * This is typically used to display a list of "friends attending" an event.
 */
export interface FriendParticipantDto {
  /**
   * The user ID of the friend.
   */
  userId: number;

  /**
   * The friend's first name.
   */
  firstName: string;

  /**
   * The friend's last name.
   */
  lastName: string;

  /**
   * URL to the friend's avatar image. Optional.
   */
  avatarUrl?: string;

}
