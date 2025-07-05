// src/app/core/models/auth/user-role.model.ts

/**
 * Enumeration of possible roles for a user.
 */
export enum UserRole {
  /**
   * Regular user who can browse events and make reservations.
   */
  SPECTATOR = 'SPECTATOR',

  /**
   * Administrator of a structure with full management permissions.
   */
  STRUCTURE_ADMINISTRATOR = 'STRUCTURE_ADMINISTRATOR',

  /**
   * User responsible for managing reservations and tickets.
   */
  RESERVATION_SERVICE = 'RESERVATION_SERVICE',

  /**
   * User responsible for organizing and managing events.
   */
  ORGANIZATION_SERVICE = 'ORGANIZATION_SERVICE'
}
