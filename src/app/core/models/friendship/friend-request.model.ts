/**
 * @file Defines models for representing friend requests (both received and sent).
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { FriendshipStatus } from './friendship-status.enum';
import { UserModel } from '../user/user.model'; // Assuming user.model.ts is in ../user/

/**
 * Represents a friend request that has been received by the current application user.
 * This model is typically used for display in a list of incoming friend requests.
 */
export interface ReceivedFriendRequestModel {
  /**
   * The ID of the underlying friendship record (`FriendshipDataModel.id`).
   * This ID is used to perform actions on the request (accept, reject).
   */
  friendshipId: number;

  /**
   * Minimal details of the user who sent the friend request.
   * Uses a subset of `UserModel` properties.
   */
  sender: Pick<UserModel, 'id' | 'firstName' | 'lastName' | 'email' | 'avatarUrl'>;

  /**
   * The current status of the friend request. For received requests, this is typically 'pending'.
   */
  status: FriendshipStatus; // Should usually be FriendshipStatus.PENDING

  /**
   * The date and time when the friend request was sent by the sender.
   */
  requestedAt: Date;
}

/**
 * Represents a friend request that was sent by the current application user to another user.
 * This model is typically used for display in a list of outgoing (sent) friend requests.
 */
export interface SentFriendRequestModel {
  /**
   * The ID of the underlying friendship record (`FriendshipDataModel.id`).
   * This ID can be used to cancel the sent request if the backend supports it.
   */
  friendshipId: number;

  /**
   * Minimal details of the user to whom the friend request was sent.
   * Uses a subset of `UserModel` properties.
   */
  receiver: Pick<UserModel, 'id' | 'firstName' | 'lastName' | 'email' | 'avatarUrl'>;

  /**
   * The current status of the friend request (e.g., 'pending' if awaiting response,
   * 'rejected' if the receiver declined, 'accepted' if they accepted).
   */
  status: FriendshipStatus;

  /**
   * The date and time when the current user sent the friend request.
   */
  sentAt: Date;
}
