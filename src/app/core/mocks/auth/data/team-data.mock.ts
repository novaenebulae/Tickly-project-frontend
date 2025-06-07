// src/app/core/mocks/auth/data/team-data.mock.ts
import { UserRole } from '../../../models/user/user-role.enum';
import {
  availableRoles,
  TeamMember,
  TeamMemberStatus,
  getRoleById,
  getRoleNameById,
  getRoleKeyById,
  getRoleIdByKey
} from '../../../models/user/team-member.model';

// Helper pour générer des dates
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};


const today = new Date();

/**
 * Membres d'équipe pour la structure ID 3 (Espace Culturel "Perspectives")
 */
export const mockTeamMembersStructure3: TeamMember[] = [
  {
    id: 101,
    userId: 10,
    structureId: 3,
    firstName: 'Sophie',
    lastName: 'Martinez',
    email: 'sophie.martinez@perspectives.com',
    role: getRoleById(2)!, // Administrateur de Structure
    status: TeamMemberStatus.ACTIVE,
    joinedAt: addDays(today, -120),
    lastActivity: addDays(today, -1),
    phone: '04 95 09 30 31',
    position: 'Directrice'
  },
  {
    id: 102,
    userId: 11,
    structureId: 3,
    firstName: 'Thomas',
    lastName: 'Dubois',
    email: 'thomas.dubois@perspectives.com',
    role: getRoleById(4)!, // Service d'Organisation
    status: TeamMemberStatus.ACTIVE,
    joinedAt: addDays(today, -95),
    lastActivity: addDays(today, -2),
    phone: '04 95 09 30 32',
    position: 'Chef de projet événementiel'
  },
  {
    id: 103,
    userId: 12,
    structureId: 3,
    firstName: 'Amélie',
    lastName: 'Leroy',
    email: 'amelie.leroy@perspectives.com',
    role: getRoleById(3)!, // Service de Réservation
    status: TeamMemberStatus.ACTIVE,
    joinedAt: addDays(today, -80),
    lastActivity: addDays(today, -1),
    phone: '04 95 09 30 33',
    position: 'Responsable billetterie'
  },
  {
    id: 104,
    userId: 13,
    structureId: 3,
    firstName: 'Marc',
    lastName: 'Rousseau',
    email: 'marc.rousseau@perspectives.com',
    role: getRoleById(4)!, // Service d'Organisation
    status: TeamMemberStatus.ACTIVE,
    joinedAt: addDays(today, -60),
    lastActivity: addDays(today, -3),
    phone: '04 95 09 30 34',
    position: 'Régisseur technique'
  },
  {
    id: 105,
    userId: 14,
    structureId: 3,
    firstName: 'Julie',
    lastName: 'Bernard',
    email: 'julie.bernard@perspectives.com',
    role: getRoleById(3)!, // Service de Réservation
    status: TeamMemberStatus.ACTIVE,
    joinedAt: addDays(today, -45),
    lastActivity: addDays(today, -4),
    phone: '04 95 09 30 35',
    position: 'Assistante réservations'
  },
  {
    id: 106,
    userId: undefined, // Pas encore d'utilisateur créé
    structureId: 3,
    firstName: null,
    lastName: null,
    email: 'nouveau.collaborateur@perspectives.com',
    role: getRoleById(3)!, // Service de Réservation en attente
    status: TeamMemberStatus.PENDING,
    joinedAt: addDays(today, -3),
    invitedAt: addDays(today, -3),
    invitedBy: 10, // Invité par Sophie Martinez
    lastActivity: undefined,
    phone: undefined,
    position: undefined
  },
  {
    id: 107,
    userId: 15,
    structureId: 3,
    firstName: 'Pierre',
    lastName: 'Moreau',
    email: 'pierre.moreau@perspectives.com',
    role: getRoleById(4)!, // Service d'Organisation
    status: TeamMemberStatus.INACTIVE,
    joinedAt: addDays(today, -200),
    lastActivity: addDays(today, -30),
    phone: '04 95 09 30 36',
    position: 'Ex-coordinateur'
  },
  {
    id: 108,
    userId: 16,
    structureId: 3,
    firstName: 'Camille',
    lastName: 'Petit',
    email: 'camille.petit@perspectives.com',
    role: getRoleById(2)!, // Administrateur de Structure
    status: TeamMemberStatus.ACTIVE,
    joinedAt: addDays(today, -30),
    lastActivity: addDays(today, -1),
    phone: '04 95 09 30 37',
    position: 'Adjointe à la direction'
  }
];

// Ré-export des helpers pour compatibilité
export { getRoleNameById, getRoleKeyById, getRoleIdByKey };
