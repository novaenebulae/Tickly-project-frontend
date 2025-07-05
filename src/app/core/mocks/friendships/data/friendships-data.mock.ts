// src/app/core/mocks/friendship/data/friendship-data.mock.ts
import {FriendshipDataModel} from '../../../models/friendship/friendship.model';
import {FriendshipStatus} from '../../../models/friendship/friendship-status.enum';

// Helper pour générer des dates (peut être partagé ou redéfini si besoin)
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
  { // Carla (id: 3) a envoyé une demande à Alice (id: 1)
    id: 2,
    senderId: 3, // Carla NouveauAdmin
    receiverId: 1,
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -5),
    updatedAt: addDays(today, -5),
  },
  { // Alice (id: 1) a envoyé une demande à David (id: 4)
    id: 3,
    senderId: 1,
    receiverId: 4, // David ResaService
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -2),
    updatedAt: addDays(today, -2),
  },
  { // Alice (id: 1) a rejeté une demande d'Eva (id: 5)
    id: 4,
    senderId: 5, // Eva OrgaService
    receiverId: 1,
    status: FriendshipStatus.REJECTED,
    createdAt: addDays(today, -10),
    updatedAt: addDays(today, -8),
  },
  { // Alice (id: 1) a bloqué Frank (id: 6)
    id: 5,
    senderId: 1,
    receiverId: 6, // Frank Dupont
    status: FriendshipStatus.BLOCKED,
    createdAt: addDays(today, -20),
    updatedAt: addDays(today, -19),
  },
  { // Grace (id: 7) était amie avec Alice (id: 1) mais a annulé
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
  { // Service LogistiqueStade (10) a envoyé une demande à Hugo (9) qui l'a rejetée
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
    senderId: 13, // Kevin ResaThéâtre
    receiverId: 14, // Laura SpectatriceActive
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -4),
    updatedAt: addDays(today, -4),
  },
  { // Marc (15) a bloqué Nina (16)
    id: 15,
    senderId: 15, // Marc OrgaParc
    receiverId: 16, // Nina AdminPlace
    status: FriendshipStatus.BLOCKED,
    createdAt: addDays(today, -25),
    updatedAt: addDays(today, -24),
  },
  { // Olivier (17) et Quentin (19) sont amis
    id: 16,
    senderId: 17, // Olivier AtelierArt
    receiverId: 19, // Quentin ResaConfluent
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -30),
    updatedAt: addDays(today, -28),
  },
  { // Thomas (21) a envoyé une demande à Sophie (20)
    id: 17,
    senderId: 21, // Thomas OrgaCafeConcert
    receiverId: 20, // Sophie AdminNovaArena
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -2),
    updatedAt: addDays(today, -2),
  },
  { // Ursula (22) et Victor (23) : demande acceptée récemment
    id: 18,
    senderId: 22, // Ursula AdminPlage
    receiverId: 23, // Victor ResaLibrairie
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -10),
    updatedAt: addDays(today, -1),
  },
  { // Wendy (24) et Xavier (25) : ancienne amitié annulée par Wendy
    id: 19,
    senderId: 25, // Xavier OrgaParcNational
    receiverId: 24, // Wendy AdminCiteBD
    status: FriendshipStatus.CANCELLED,
    createdAt: addDays(today, -200),
    updatedAt: addDays(today, -50),
  },
  { // Bob (2) a envoyé une demande à Alice (1) qui est PENDING (doublon intentionnel pour tester la vue d'Alice)
    id: 20,
    senderId: 2,
    receiverId: 1,
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -6),
    updatedAt: addDays(today, -6),
  },
  { // David (4) et Christophe-Alexandre (8) sont amis
    id: 21,
    senderId: 4,
    receiverId: 8,
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -75),
    updatedAt: addDays(today, -70),
  },
  { // Alice (1) a envoyé une demande à Isabelle (11) qui est PENDING
    id: 22,
    senderId: 1,
    receiverId: 11,
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -1),
    updatedAt: addDays(today, -1),
  },
  { // Marc (15) a une demande REJECTED envoyée par Olivier (17)
    id: 23,
    senderId: 17,
    receiverId: 15,
    status: FriendshipStatus.REJECTED,
    createdAt: addDays(today, -12),
    updatedAt: addDays(today, -11),
  },
  { // Alice (1) est bloquée par Sophie (20) (le senderId est celui qui bloque)
    id: 24,
    senderId: 20, // Sophie bloque Alice
    receiverId: 1,
    status: FriendshipStatus.BLOCKED,
    createdAt: addDays(today, -33),
    updatedAt: addDays(today, -32),
  },
  { // Ursula (22) a annulé son amitié avec Xavier (25) (Ursula est senderId d'une précédente relation ACCEPTED)
    // Pour simuler une annulation, on prend une relation ACCEPTED et on la passe à CANCELLED.
    // Ici, nous créons une nouvelle entrée pour illustrer une annulation après une période.
    // En réalité, une annulation mettrait à jour une relation existante.
    // Pour le mock, on peut avoir une entrée "CANCELLED" pour montrer l'état.
    // Supposons que 22 et 25 étaient amis (via une autre ID de relation non listée ici)
    // et que l'ID 25 représente l'état final CANCELLED de cette relation.
    // Pour plus de simplicité, on peut dire que l'ID 19 représente l'état final.
    // Je vais ajouter une nouvelle relation pour illustrer :
    id: 25,
    senderId: 22, // Ursula
    receiverId: 25, // Xavier
    status: FriendshipStatus.CANCELLED, // Ursula a annulé
    createdAt: addDays(today, -95), // Date de l'amitié initiale
    updatedAt: addDays(today, -85), // Date de l'annulation
  },
  // Quelques autres pour la diversité
  {
    id: 26,
    senderId: 3, // Carla
    receiverId: 6, // Frank
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -42),
    updatedAt: addDays(today, -40),
  },
  {
    id: 27,
    senderId: 14, // Laura
    receiverId: 1, // Alice
    status: FriendshipStatus.PENDING,
    createdAt: addDays(today, -0), // Demande toute fraîche
    updatedAt: addDays(today, -0),
  },
  {
    id: 28,
    senderId: 9, // Hugo
    receiverId: 13, // Kevin
    status: FriendshipStatus.ACCEPTED,
    createdAt: addDays(today, -18),
    updatedAt: addDays(today, -18),
  },
];
