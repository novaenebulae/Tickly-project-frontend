/**
 * @file Defines models for representing friend requests (both received and sent).
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Defines the user information associated with a friend request,
 * matching the data sent by the API.
 */
export interface FriendRequestParticipant {
  /**
   * The unique identifier of the user.
   */
  id: number;

  /**
   * The first name of the user.
   */
  firstName: string;

  /**
   * The last name of the user.
   */
  lastName: string;

  /**
   * URL to the user's avatar image. Optional.
   */
  avatarUrl?: string;
}

/**
 * Represents a friend request that has been received by the current application user.
 * This model is used for display in a list of incoming friend requests.
 */
export interface ReceivedFriendRequestModel {
  /**
   * The ID of the friendship record, used to perform actions (accept, reject).
   */
  friendshipId: number;

  /**
   * Details of the user who sent the friend request.
   */
  sender: FriendRequestParticipant;

  /**
   * The date and time when the request was sent (ISO 8601 string).
   */
  requestedAt: string;
}

/**
 * Represents a friend request that was sent by the current application user.
 * This model is used for display in a list of outgoing friend requests.
 */
export interface SentFriendRequestModel {
  /**
   * The ID of the friendship record, used to cancel the request.
   */
  friendshipId: number;

  /**
   * Details of the user to whom the friend request was sent.
   */
  receiver: FriendRequestParticipant;

  /**
   * The date and time when the request was sent (ISO 8601 string).
   */
  sentAt: string;
}
