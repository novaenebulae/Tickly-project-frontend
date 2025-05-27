// src/app/core/models/auth/user-role.model.ts

/**
 * Enumération des rôles possibles pour un utilisateur.
 */
export enum UserRole {
  SPECTATOR = 'spectator',
  STRUCTURE_ADMINISTRATOR = 'structure_administrator',
  RESERVATION_SERVICE = 'reservation_service',
  ORGANIZATION_SERVICE = 'organization_service'
}
