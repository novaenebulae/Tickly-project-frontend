/**
 * @file Defines the core data model for a friendship link and related DTOs for API actions.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {FriendshipStatus} from './friendship-status.enum';

/**
 * Represents the raw data structure of a friendship link between two users,
 * as it might be stored in the database or returned directly by an API.
 * This is the primary entity for a friendship.
 */
export interface FriendshipDataModel {
  /**
   * The unique identifier for the friendship record.
   */
  id: number;

  /**
   * The ID of the user who initiated the friendship request (sender).
   */
  senderId: number;

  /**
   * The ID of the user who received the friendship request (receiver).
   */
  receiverId: number;

  /**
   * The current status of the friendship.
   */
  status: FriendshipStatus;

  /**
   * The date and time when the friendship record was created (i.e., request was sent).
   */
  createdAt: Date;

  /**
   * The date and time when the friendship record was last updated (e.g., status change).
   */
  updatedAt: Date;
}

// --- DTOs for API Actions ---

/**
 * Data Transfer Object for sending a new friend request.
 * The backend will use either `receiverId` or `receiverEmail` to identify the target user.
 */
export interface SendFriendRequestDto {

  /**
   * The email address of the person to whom the friend request is being sent.
   * Use this if the sender knows the receiver's email address.
   * The backend will resolve this to a user ID.
   * Mutually exclusive with `receiverId`.
   */
  email?: string;
}

/**
 * Data Transfer Object for updating the status of a friendship or friend request.
 * This is used for actions such as accepting, rejecting, blocking, or cancelling a friendship.
 */
export interface UpdateFriendshipStatusDto {
  /**
   * The new status to set for the friendship.
   * The backend will validate if the status transition is allowed.
   */
  status: FriendshipStatus;
}
