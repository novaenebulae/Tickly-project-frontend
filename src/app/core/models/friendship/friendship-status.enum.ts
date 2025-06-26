/**
 * Defines the possible statuses of a friendship or friend request.
 */
export enum FriendshipStatus {
  /**
   * The friend request has been sent and is awaiting a response.
   */
  PENDING = 'pending',

  /**
   * The friend request has been accepted, and the users are now friends.
   */
  ACCEPTED = 'ACCEPTED',

  /**
   * The friend request has been rejected by the receiver.
   */
  REJECTED = 'REJECTED',

  /**
   * One user has blocked the other. This status might prevent further interaction.
   * This can apply to an existing friendship or prevent new requests.
   */
  BLOCKED = 'BLOCKED',

  /**
   * The friendship was cancelled by one of the users (unfriended).
   * This is distinct from 'rejected' which applies to a request.
   */
  CANCELLED = 'CANCELLED_BY_SENDER' // Ajouté pour plus de clarté par rapport à 'rejected'
}
