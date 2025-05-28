// src/app/core/mocks/friendship/friendships.mock.ts
import { FriendshipDataModel } from '../../../models/friendship/friendship.model';
import { FriendshipStatus } from '../../../models/friendship/friendship-status.enum';

// Helper pour générer des dates (similaire à events.mock.ts)
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const today = new Date();

// Rappel des IDs utilisateurs de mockUsers (1 à 25)
// currentUserId dans FriendshipApiMockService est 1 (Alice Spectateur)

export const mockFriendships: FriendshipDataModel[] = [
  // --- Relations pour Alice (id: 1) ---
  { // Alice et Bob (id: 2) sont amis
    id: 1,
    senderId: 1,
    receiverId: 2, // Bob AdminStruct
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -100),
    updatedAt: addDays(today, -90),
  },
  { // Carla (id: 3) a envoyé une demande à Alice
    id: 2,
    senderId: 3, // Carla NouveauAdmin
    receiverId: 1,
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -5),
    updatedAt: addDays(today, -5),
  },
  { // Alice a envoyé une demande à David (id: 4)
    id: 3,
    senderId: 1,
    receiverId: 4, // David ResaService
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -2),
    updatedAt: addDays(today, -2),
  },
  { // Alice a rejeté une demande d'Eva (id: 5)
    id: 4,
    senderId: 5, // Eva OrgaService
    receiverId: 1,
    status: FriendshipStatus.REJECTED,
    createdAt: addDays(today, -10),
    updatedAt: addDays(today, -8),
  },
  { // Alice a bloqué Frank (id: 6) (ou Frank l'a bloquée, le sens du blocage peut être géré par qui initie)
    id: 5,
    senderId: 1, // Alice initie le blocage
    receiverId: 6, // Frank Dupont
    status: FriendshipStatus.BLOCKED,
    createdAt: addDays(today, -20),
    updatedAt: addDays(today, -19),
  },
  { // Alice était amie avec Grace (id: 7) mais a annulé
    id: 6,
    senderId: 7, // Grace Martin
    receiverId: 1,
    status: FriendshipStatus.CANCELLED, // Supposons que Grace a annulé l'amitié
    createdAt: addDays(today, -120),
    updatedAt: addDays(today, -15),
  },

  // --- Relations entre autres utilisateurs ---
  { // Bob (2) et Carla (3) sont amis
    id: 7,
    senderId: 2,
    receiverId: 3,
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -80),
    updatedAt: addDays(today, -70),
  },
  { // Bob (2) a envoyé une demande à Hugo (9)
    id: 8,
    senderId: 2,
    receiverId: 9, // Hugo Sportif
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -3),
    updatedAt: addDays(today, -3),
  },
  { // David (4) et Eva (5) sont amis
    id: 9,
    senderId: 4,
    receiverId: 5,
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -60),
    updatedAt: addDays(today, -55),
  },
  { // Frank (6) a une demande en attente de Grace (7)
    id: 10,
    senderId: 6,
    receiverId: 7,
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -1),
    updatedAt: addDays(today, -1),
  },
  { // Christophe-Alexandre (8) et Pauline (18) sont amis
    id: 11,
    senderId: 8,
    receiverId: 18, // Pauline SpectateurVIP
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -40),
    updatedAt: addDays(today, -35),
  },
  { // Hugo (9) a rejeté une demande de Service LogistiqueStade (10) (peu probable mais pour tester)
    id: 12,
    senderId: 10,
    receiverId: 9,
    status: FriendshipStatus.REJECTED,
    createdAt: addDays(today, -7),
    updatedAt: addDays(today, -6),
  },
  { // Isabelle (11) et Julien (12) sont amis
    id: 13,
    senderId: 11,
    receiverId: 12, // Julien Petit (Admin Structure 5)
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -50),
    updatedAt: addDays(today, -45),
  },
  { // Kevin (13) a envoyé une demande à Laura (14)
    id: 14,
    senderId: 13,
    receiverId: 14,
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -4),
    updatedAt: addDays(today, -4),
  },
  { // Marc (15) a bloqué Nina (16)
    id: 15,
    senderId: 15,
    receiverId: 16,
    status: FriendshipStatus.BLOCKED,
    createdAt: addDays(today, -25),
    updatedAt: addDays(today, -24),
  },
  { // Olivier (17) et Quentin (19) sont amis
    id: 16,
    senderId: 17,
    receiverId: 19,
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -30),
    updatedAt: addDays(today, -28),
  },
  { // Sophie (20) a une demande en attente de Thomas (21)
    id: 17,
    senderId: 21,
    receiverId: 20,
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -2),
    updatedAt: addDays(today, -2),
  },
  { // Ursula (22) et Victor (23) : demande acceptée récemment
    id: 18,
    senderId: 22,
    receiverId: 23,
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -10),
    updatedAt: addDays(today, -1), // Acceptée hier
  },
  { // Wendy (24) et Xavier (25) : ancienne amitié annulée par Wendy
    id: 19,
    senderId: 25,
    receiverId: 24,
    status: FriendshipStatus.CANCELLED,
    createdAt: addDays(today, -200),
    updatedAt: addDays(today, -50), // Annulée il y a 50 jours
  },
  { // Demande de l'utilisateur 2 (Bob) à l'utilisateur 1 (Alice) qui est PENDING
    id: 20,
    senderId: 2, // Bob AdminStruct
    receiverId: 1, // Alice Spectateur
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -6),
    updatedAt: addDays(today, -6),
  },
  { // Amitié entre l'utilisateur 4 (David) et l'utilisateur 8 (Christophe-Alexandre)
    id: 21,
    senderId: 4,
    receiverId: 8,
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -75),
    updatedAt: addDays(today, -70),
  },
  { // L'utilisateur 1 (Alice) a envoyé une demande à l'utilisateur 11 (Isabelle) qui est PENDING
    id: 22,
    senderId: 1,
    receiverId: 11,
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -1),
    updatedAt: addDays(today, -1),
  },
  { // L'utilisateur 15 (Marc) a une demande REJECTED de l'utilisateur 17 (Olivier)
    id: 23,
    senderId: 17,
    receiverId: 15,
    status: FriendshipStatus.REJECTED,
    createdAt: addDays(today, -12),
    updatedAt: addDays(today, -11),
  },
  { // L'utilisateur 1 (Alice) a une amitié BLOCKED avec l'utilisateur 20 (Sophie)
    id: 24, // Alice a bloqué Sophie
    senderId: 1,
    receiverId: 20,
    status: FriendshipStatus.BLOCKED,
    createdAt: addDays(today, -33),
    updatedAt: addDays(today, -32),
  },
  { // L'utilisateur 22 (Ursula) a une amitié CANCELLED avec l'utilisateur 25 (Xavier)
    id: 25, // Ursula a annulé
    senderId: 22,
    receiverId: 25,
    status: FriendshipStatus.CANCELLED,
    createdAt: addDays(today, -95),
    updatedAt: addDays(today, -85),
  }
];
