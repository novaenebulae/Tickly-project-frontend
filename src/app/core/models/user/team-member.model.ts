/**
 * @file Models for managing team members of a structure.
 * @licence Proprietary
 */

import {UserRole} from './user-role.enum';

/**
 * Represents a team member of a structure.
 * This can be an active member or a pending invitation.
 */
export interface TeamMember {
  /**
   * The unique identifier for the team member record.
   */
  id: number;

  /**
   * The user ID of the team member. Optional for pending invitations.
   */
  userId?: number;

  /**
   * The ID of the structure this team member belongs to.
   */
  structureId?: number;

  /**
   * The first name of the team member. Can be null for pending invitations.
   */
  firstName: string | null;

  /**
   * The last name of the team member. Can be null for pending invitations.
   */
  lastName: string | null;

  /**
   * URL to the team member's avatar image.
   */
  avatarUrl?: string;

  /**
   * The email address of the team member.
   */
  email: string;

  /**
   * The role of the team member within the structure.
   * This is a direct UserRole enum value, not a complex object.
   */
  role: UserRole;

  /**
   * The current status of the team member (active or pending invitation).
   */
  status: TeamMemberStatus;

  /**
   * The date when the team member joined the structure.
   */
  joinedAt?: Date;

  /**
   * The date when the invitation was sent to the team member.
   */
  invitedAt?: Date;

  /**
   * The ID of the user who sent the invitation.
   */
  invitedBy?: number;

  /**
   * The date of the team member's last activity.
   */
  lastActivity?: Date;

  /**
   * The phone number of the team member.
   */
  phone?: string;

  /**
   * The position or job title of the team member within the organization.
   */
  position?: string;
}

/**
 * Defines the possible statuses of a team member.
 */
export enum TeamMemberStatus {
  /**
   * The team member is active and has full access to their role's permissions.
   */
  ACTIVE = 'ACTIVE',

  /**
   * The team member has been invited but has not yet accepted the invitation.
   */
  PENDING = 'PENDING_INVITATION',
}

/**
 * Data Transfer Object for inviting a new team member.
 * Used when sending an invitation to join a structure's team.
 */
export interface InviteTeamMemberDto {
  /**
   * The email address of the person to invite.
   */
  email: string;

  /**
   * The role to assign to the invited team member.
   */
  role: UserRole;
}

/**
 * Data Transfer Object for updating an existing team member's information.
 * All properties are optional for partial updates.
 */
export interface UpdateTeamMemberDto {
  /**
   * The new role to assign to the team member.
   */
  role?: UserRole;

  /**
   * The new status to set for the team member.
   */
  status?: TeamMemberStatus;

  /**
   * The new position or job title of the team member within the organization.
   */
  position?: string;

  /**
   * The new phone number of the team member.
   */
  phone?: string;
}

/**
 * Mapping of user roles to their display names in French.
 * Used for UI presentation of roles.
 */
export const TEAM_ROLES_DISPLAY = {
  [UserRole.STRUCTURE_ADMINISTRATOR]: 'Administrateur',
  [UserRole.RESERVATION_SERVICE]: 'Service de Réservation',
  [UserRole.ORGANIZATION_SERVICE]: 'Service d\'Organisation',
  [UserRole.SPECTATOR]: 'Spectateur',
} as const;

/**
 * Array of roles that are allowed for structure team members.
 * Excludes the SPECTATOR role which is for regular users, not team members.
 */
export const ALLOWED_TEAM_ROLES = [
  UserRole.STRUCTURE_ADMINISTRATOR,
  UserRole.RESERVATION_SERVICE,
  UserRole.ORGANIZATION_SERVICE
] as UserRole[];

/**
 * Checks if a role is allowed for structure team members.
 *
 * @param role - The role to check
 * @returns True if the role is allowed for team members, false otherwise
 */
export function isAllowedTeamRole(role: UserRole): boolean {
  return ALLOWED_TEAM_ROLES.includes(role as any);
}

/**
 * Gets the display name for a user role.
 *
 * @param role - The role to get the display name for
 * @returns The display name in French, or the role itself if no display name is defined
 */
export function getRoleDisplayName(role: UserRole): string {
  return TEAM_ROLES_DISPLAY[role] || role;
}
