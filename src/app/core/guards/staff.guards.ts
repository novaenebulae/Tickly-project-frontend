import {UserRole} from '../models/user/user-role.enum';
import {createRoleBasedGuard} from './role-based-access.guard';

// === Guards pour la gestion de structure ===

/**
 * Guard pour l'accès étendu à la structure (inclut RESERVATION_SERVICE en readonly)
 * Accès : STRUCTURE_ADMINISTRATOR (complet) + ORGANIZATION_SERVICE (readonly) + RESERVATION_SERVICE (readonly)
 */
export const StructureExtendedAccessGuard = createRoleBasedGuard({
  allowedRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE, UserRole.RESERVATION_SERVICE],
  deniedMessage: 'Vous devez avoir un rôle de staff pour accéder à cette page.',
  guardName: 'StructureExtendedAccessGuard'
});

// === Guards pour la gestion d'événements ===

/**
 * Guard pour la gestion d'événements
 * Accès : STRUCTURE_ADMINISTRATOR (complet) + ORGANIZATION_SERVICE (readonly)
 */
export const EventManagementGuard = createRoleBasedGuard({
  allowedRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE],
  deniedMessage: 'Vous devez être administrateur de structure ou service d\'organisation pour accéder à la gestion d\'événements.',
  guardName: 'EventManagementGuard'
});

/**
 * Guard pour l'accès étendu aux événements (inclut RESERVATION_SERVICE en readonly)
 * Accès : STRUCTURE_ADMINISTRATOR (complet) + ORGANIZATION_SERVICE (readonly) + RESERVATION_SERVICE (readonly)
 */
export const EventExtendedAccessGuard = createRoleBasedGuard({
  allowedRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE, UserRole.RESERVATION_SERVICE],
  deniedMessage: 'Vous devez avoir un rôle de staff pour accéder aux événements.',
  guardName: 'EventExtendedAccessGuard'
});

// === Guards pour la gestion d'équipe ===

/**
 * Guard pour la gestion d'équipe
 * Accès : STRUCTURE_ADMINISTRATOR (complet) + ORGANIZATION_SERVICE (readonly)
 */
export const TeamManagementGuard = createRoleBasedGuard({
  allowedRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE],
  deniedMessage: 'Vous devez être administrateur de structure ou service d\'organisation pour accéder à la gestion d\'équipe.',
  guardName: 'TeamManagementGuard'
});

// === Guards pour les zones ===

/**
 * Guard pour l'accès aux zones
 * Accès : STRUCTURE_ADMINISTRATOR (complet) + ORGANIZATION_SERVICE (readonly)
 */
export const AreasAccessGuard = createRoleBasedGuard({
  allowedRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE],
  deniedMessage: 'Vous devez être administrateur de structure ou service d\'organisation pour accéder aux zones de structure.',
  guardName: 'AreasAccessGuard'
});

/**
 * Guard pour l'accès étendu aux zones (inclut RESERVATION_SERVICE en readonly)
 * Accès : STRUCTURE_ADMINISTRATOR (complet) + ORGANIZATION_SERVICE (readonly) + RESERVATION_SERVICE (readonly)
 */
export const AreasExtendedAccessGuard = createRoleBasedGuard({
  allowedRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE, UserRole.RESERVATION_SERVICE],
  deniedMessage: 'Vous devez avoir un rôle de staff pour accéder aux zones de structure.',
  guardName: 'AreasExtendedAccessGuard'
});

// === Guards génériques pour différents niveaux d'accès ===

/**
 * Guard pour tous les rôles de staff
 * Accès : STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE + RESERVATION_SERVICE
 */
export const StaffGuard = createRoleBasedGuard({
  allowedRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE, UserRole.RESERVATION_SERVICE],
  deniedMessage: 'Vous devez avoir un rôle de staff pour accéder à cette page.',
  guardName: 'StaffGuard'
});

/**
 * Guard pour la validation de billets
 * Accès : Tous les rôles de staff
 */
export const TicketValidationGuard = createRoleBasedGuard({
  allowedRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE, UserRole.RESERVATION_SERVICE],
  deniedMessage: 'Vous devez avoir un rôle de staff pour accéder à la validation de billets.',
  guardName: 'TicketValidationGuard'
});
