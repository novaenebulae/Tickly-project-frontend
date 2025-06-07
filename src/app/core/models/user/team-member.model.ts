/**
 * @file Modèles pour la gestion des membres d'équipe d'une structure.
 * @licence Proprietary
 */

import { UserRole } from './user-role.enum';

export interface Role {
  id: number;
  name: string;
  key: UserRole;
}

/**
 * Rôles disponibles avec mapping vers UserRole enum
 */
export const availableRoles: Role[] = [
  {
    id: 1,
    name: 'Spectateur',
    key: UserRole.SPECTATOR
  },
  {
    id: 2,
    name: 'Administrateur de Structure',
    key: UserRole.STRUCTURE_ADMINISTRATOR
  },
  {
    id: 3,
    name: 'Service de Réservation',
    key: UserRole.RESERVATION_SERVICE
  },
  {
    id: 4,
    name: 'Service d\'Organisation',
    key: UserRole.ORGANIZATION_SERVICE
  }
];

export interface TeamMember {
  id: number;
  userId?: number; // Optionnel pour les invitations en attente
  structureId: number;
  firstName: string | null; // Peut être null pour les invitations en attente
  lastName: string | null; // Peut être null pour les invitations en attente
  email: string;
  role: Role; // Objet Role complet, pas juste l'ID
  status: TeamMemberStatus;
  joinedAt: Date;
  invitedAt?: Date;
  invitedBy?: number; // ID de l'utilisateur qui a envoyé l'invitation
  lastActivity?: Date;
  phone?: string;
  position?: string; // Poste dans l'organisation
}

export enum TeamMemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE'
}

// DTOs pour les API calls
export interface InviteTeamMemberDto {
  email: string;
  roleId: number;
}

export interface UpdateTeamMemberRoleDto {
  roleId: number;
}

export interface UpdateTeamMemberStatusDto {
  status: TeamMemberStatus;
}

export interface UpdateTeamMemberDto {
  roleId?: number;
  status?: TeamMemberStatus;
  position?: string;
  phone?: string;
}

// Type pour la réponse de l'API lors d'une invitation
export interface InviteTeamMemberResponseDto {
  success: boolean;
  member?: TeamMember;
  message?: string;
}

// Helper pour affichage des rôles
export const TEAM_ROLES_DISPLAY = {
  [UserRole.STRUCTURE_ADMINISTRATOR]: 'Administrateur',
  [UserRole.RESERVATION_SERVICE]: 'Service de Réservation',
  [UserRole.ORGANIZATION_SERVICE]: 'Service d\'Organisation'
} as const;

// Rôles autorisés pour une équipe de structure (excluant SPECTATOR)
export const ALLOWED_TEAM_ROLES = [
  UserRole.STRUCTURE_ADMINISTRATOR,
  UserRole.RESERVATION_SERVICE,
  UserRole.ORGANIZATION_SERVICE
] as const;

// Helpers pour les rôles
export function getRoleNameById(roleId: number): string {
  const role = availableRoles.find(r => r.id === roleId);
  return role ? role.name : 'Rôle inconnu';
}

export function getRoleKeyById(roleId: number): UserRole | undefined {
  const role = availableRoles.find(r => r.id === roleId);
  return role ? role.key : undefined;
}

export function getRoleIdByKey(key: UserRole): number | undefined {
  const role = availableRoles.find(r => r.key === key);
  return role ? role.id : undefined;
}

export function getRoleById(roleId: number): Role | undefined {
  return availableRoles.find(r => r.id === roleId);
}

export function isAllowedTeamRole(role: UserRole): boolean {
  return ALLOWED_TEAM_ROLES.includes(role as any);
}
