/**
 * @file Defines the model for representing a friend in the application.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Represents a user who is a friend of the current application user.
 * This model is primarily used for display purposes, such as in a friends list.
 * It combines user details with the context of the friendship.
 */
export interface FriendModel {
  /**
   * The user ID of the friend. This is the primary identifier for the user.
   */
  userId: number;

  /**
   * The ID of the underlying friendship record (`FriendshipDataModel.id`)
   * that establishes this friendship.
   */
  friendshipId: number;

  /**
   * The friend's first name.
   */
  firstName: string;

  /**
   * The friend's last name.
   */
  lastName: string;

  /**
   * The friend's email address.
   * Note: Displaying emails should consider user privacy settings.
   */
  email: string;

  /**
   * URL to the friend's avatar image. Optional.
   */
  avatarUrl?: string;

  // isOnline: boolean; // Removed as per new requirements
  // lastSeen?: Date;   // Removed as per new requirements
}
