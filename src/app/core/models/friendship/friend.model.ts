/**
 * @file Defines the model for representing a friend in the application.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Represents the detailed information of the friend user.
 * This corresponds to the nested 'friend' object in the API response.
 */
export interface FriendDetailsModel {
  /**
   * The user ID of the friend. This is the primary identifier for the user.
   */
  id: number;

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

/**
 * Represents a user who is a friend of the current application user, matching the API structure.
 * This model is primarily used for display purposes, such as in a friends list.
 * It combines user details with the context of the friendship.
 */
export interface FriendModel {
  /**
   * The ID of the underlying friendship record that establishes this friendship.
   */
  friendshipId: number;

  /**
   * The detailed information of the friend.
   */
  friend: FriendDetailsModel;

  /**
   * The date (as an ISO string) since when the friendship is active.
   */
  since: string;
}
