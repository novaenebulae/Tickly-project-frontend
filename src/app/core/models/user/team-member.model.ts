/**
 * @file Modèles pour la gestion des membres d'équipe d'une structure.
 * @licence Proprietary
 */

import { UserRole } from './user-role.enum';

export interface TeamMember {
  id: number;
  userId?: number; // Optionnel pour les invitations en attente
  structureId?: number;
  firstName: string | null; // Peut être null pour les invitations en attente
  lastName: string | null; // Peut être null pour les invitations en attente
  avatarUrl?: string;
  email: string;
  role: UserRole; // Directement le UserRole, pas un objet complexe
  status: TeamMemberStatus;
  joinedAt?: Date;
  invitedAt?: Date;
  invitedBy?: number; // ID de l'utilisateur qui a envoyé l'invitation
  lastActivity?: Date;
  phone?: string;
  position?: string; // Poste dans l'organisation
}

export enum TeamMemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING_INVITATION',
}

// DTOs pour les API calls
export interface InviteTeamMemberDto {
  email: string;
  role: UserRole;
}

export interface UpdateTeamMemberDto {
  role?: UserRole;
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
  [UserRole.ORGANIZATION_SERVICE]: 'Service d\'Organisation',
  [UserRole.SPECTATOR]: 'Spectateur',
} as const;

// Rôles autorisés pour une équipe de structure (excluant SPECTATOR)
export const ALLOWED_TEAM_ROLES = [
  UserRole.STRUCTURE_ADMINISTRATOR,
  UserRole.RESERVATION_SERVICE,
  UserRole.ORGANIZATION_SERVICE
] as UserRole[];

// Helper simplifié
export function isAllowedTeamRole(role: UserRole): boolean {
  return ALLOWED_TEAM_ROLES.includes(role as any);
}

// Helper pour obtenir le nom d'affichage d'un rôle
export function getRoleDisplayName(role: UserRole): string {
  return TEAM_ROLES_DISPLAY[role] || role;
}
