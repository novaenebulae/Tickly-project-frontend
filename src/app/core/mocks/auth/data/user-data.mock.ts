// src/app/core/mocks/auth/users.mock.ts
import { UserModel } from '../../../models/user/user.model';
import { UserRole } from '../../../models/user/user-role.enum';

// Helper pour générer des dates (similaire à events.mock.ts)
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const today = new Date();

/**
 * Extended UserModel for mock purposes, including password and mockToken for AuthApiMockService.
 * These extra fields are NOT part of the official UserModel.
 */
export interface MockUserModel extends UserModel {
  password?: string; // For mock login simulation
  mockToken: string;  // For mock login simulation
}

export const mockUsers: MockUserModel[] = [
  // --- Utilisateur 1: Spectateur Standard ---
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Spectateur',
    email: 'alice.spectateur@example.com',
    password: 'password123',
    role: UserRole.SPECTATOR,
    structureId: undefined, // OK pour SPECTATOR
    createdAt: addDays(today, -200),
    updatedAt: addDays(today, -10),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user1/200/200`,
    mockToken: `mock_token_alice_spectateur_${Date.now()}`
  },
  // --- Utilisateur 2: Admin de Structure (Structure 1) ---
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'AdminStruct',
    email: 'bob.adminstruct@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 1, // Le Grand Complexe Événementiel Parisien
    createdAt: addDays(today, -150),
    updatedAt: addDays(today, -5),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user2/200/200`,
    mockToken: `mock_token_bob_adminstruct_${Date.now()}`
  },
  // --- Utilisateur 3: Admin de Structure (Structure 2, doit configurer) ---
  {
    id: 3,
    firstName: 'Carla',
    lastName: 'NouveauAdmin',
    email: 'carla.nouveauadmin@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 2, // Auditorium Harmonia
    createdAt: addDays(today, -5),
    updatedAt: addDays(today, -1),
    needsStructureSetup: true,
    avatarUrl: `https://picsum.photos/seed/user3/200/200`,
    mockToken: `mock_token_carla_nouveauadmin_${Date.now()}`
  },
  // --- Utilisateur 4: Service de Réservation (Structure 1) ---
  {
    id: 4,
    firstName: 'David',
    lastName: 'ResaService',
    email: 'david.resa@example.com',
    password: 'password123',
    role: UserRole.RESERVATION_SERVICE,
    structureId: 1, // Lié à la structure 1
    createdAt: addDays(today, -100),
    updatedAt: addDays(today, -20),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user4/200/200`,
    mockToken: `mock_token_david_resa_${Date.now()}`
  },
  // --- Utilisateur 5: Service d'Organisation (Structure 1) ---
  {
    id: 5,
    firstName: 'Eva',
    lastName: 'OrgaService',
    email: 'eva.orga@example.com',
    password: 'password123',
    role: UserRole.ORGANIZATION_SERVICE,
    structureId: 1, // Lié à la structure 1 (Grand Complexe) - CORRIGÉ
    createdAt: addDays(today, -120),
    updatedAt: addDays(today, -15),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user5/200/200`,
    mockToken: `mock_token_eva_orga_${Date.now()}`
  },
  // --- Utilisateur 6: Autre Spectateur ---
  {
    id: 6,
    firstName: 'Frank',
    lastName: 'Dupont',
    email: 'frank.dupont@example.com',
    password: 'password123',
    role: UserRole.SPECTATOR,
    structureId: undefined, // OK pour SPECTATOR
    createdAt: addDays(today, -80),
    updatedAt: addDays(today, -8),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user6/200/200`,
    mockToken: `mock_token_frank_dupont_${Date.now()}`
  },
  // --- Utilisateur 7: Admin d'une autre Structure (Structure 3) ---
  {
    id: 7,
    firstName: 'Grace',
    lastName: 'Martin',
    email: 'grace.martin@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 3, // Espace Culturel "Perspectives"
    createdAt: addDays(today, -250),
    updatedAt: addDays(today, -30),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user7/200/200`,
    mockToken: `mock_token_grace_martin_${Date.now()}`
  },
  // --- Utilisateur 8: Spectateur avec un nom long ---
  {
    id: 8,
    firstName: 'Christophe-Alexandre',
    lastName: 'De La Tour-Moreau',
    email: 'long.nom@example.com',
    password: 'password123',
    role: UserRole.SPECTATOR,
    structureId: undefined, // OK pour SPECTATOR
    createdAt: addDays(today, -50),
    updatedAt: addDays(today, -3),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user8/200/200`,
    mockToken: `mock_token_long_nom_${Date.now()}`
  },
  // --- Utilisateur 9: Admin de la Structure Sportive (Structure 4) ---
  {
    id: 9,
    firstName: 'Hugo',
    lastName: 'Sportif',
    email: 'hugo.sportif@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 4, // Stade Municipal de Bordeaux
    createdAt: addDays(today, -300),
    updatedAt: addDays(today, -40),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user9/200/200`,
    mockToken: `mock_token_hugo_sportif_${Date.now()}`
  },
  // --- Utilisateur 10: Compte de service lié à une structure (Structure 4) ---
  {
    id: 10,
    firstName: 'Service',
    lastName: 'LogistiqueStade',
    email: 'service.logistique.stade@example.com',
    password: 'password123',
    role: UserRole.ORGANIZATION_SERVICE, // Exemple
    structureId: 4, // Lié au Stade Municipal de Bordeaux - CORRIGÉ
    createdAt: addDays(today, -400),
    updatedAt: addDays(today, -50),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user10/200/200`,
    mockToken: `mock_token_service_logistique_${Date.now()}`
  },

  // --- Nouveaux Utilisateurs (15 supplémentaires, respectant la règle structureId) ---
  {
    id: 11,
    firstName: 'Isabelle',
    lastName: 'Leroy',
    email: 'isabelle.leroy@example.com',
    password: 'password123',
    role: UserRole.SPECTATOR,
    structureId: undefined, // OK
    createdAt: addDays(today, -180),
    updatedAt: addDays(today, -12),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user11/200/200`,
    mockToken: `mock_token_isabelle_leroy_${Date.now()}`
  },
  {
    id: 12,
    firstName: 'Julien',
    lastName: 'Petit',
    email: 'julien.petit@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 5, // Théâtre de la Comète
    createdAt: addDays(today, -90),
    updatedAt: addDays(today, -9),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user12/200/200`,
    mockToken: `mock_token_julien_petit_${Date.now()}`
  },
  {
    id: 13,
    firstName: 'Kevin',
    lastName: 'ResaThéâtre',
    email: 'kevin.resa.theatre@example.com',
    password: 'password123',
    role: UserRole.RESERVATION_SERVICE,
    structureId: 5, // Théâtre de la Comète
    createdAt: addDays(today, -70),
    updatedAt: addDays(today, -7),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user13/200/200`,
    mockToken: `mock_token_kevin_resa_theatre_${Date.now()}`
  },
  {
    id: 14,
    firstName: 'Laura',
    lastName: 'SpectatriceActive',
    email: 'laura.active@example.com',
    password: 'password123',
    role: UserRole.SPECTATOR,
    structureId: undefined, // OK
    createdAt: addDays(today, -60),
    updatedAt: addDays(today, -6),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user14/200/200`,
    mockToken: `mock_token_laura_active_${Date.now()}`
  },
  {
    id: 15,
    firstName: 'Marc',
    lastName: 'OrgaParc',
    email: 'marc.orga.parc@example.com',
    password: 'password123',
    role: UserRole.ORGANIZATION_SERVICE,
    structureId: 6, // Grand Parc Urbain
    createdAt: addDays(today, -50),
    updatedAt: addDays(today, -5),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user15/200/200`,
    mockToken: `mock_token_marc_orga_parc_${Date.now()}`
  },
  {
    id: 16,
    firstName: 'Nina',
    lastName: 'AdminPlace',
    email: 'nina.admin.place@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 7, // Place de la République
    createdAt: addDays(today, -40),
    updatedAt: addDays(today, -4),
    needsStructureSetup: true,
    avatarUrl: `https://picsum.photos/seed/user16/200/200`,
    mockToken: `mock_token_nina_admin_place_${Date.now()}`
  },
  {
    id: 17,
    firstName: 'Olivier',
    lastName: 'AtelierArt',
    email: 'olivier.atelier@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 8, // Les Ateliers Créatifs
    createdAt: addDays(today, -30),
    updatedAt: addDays(today, -3),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user17/200/200`,
    mockToken: `mock_token_olivier_atelier_${Date.now()}`
  },
  {
    id: 18,
    firstName: 'Pauline',
    lastName: 'SpectateurVIP',
    email: 'pauline.vip@example.com',
    password: 'password123',
    role: UserRole.SPECTATOR,
    structureId: undefined, // OK
    createdAt: addDays(today, -20),
    updatedAt: addDays(today, -2),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user18/200/200`,
    mockToken: `mock_token_pauline_vip_${Date.now()}`
  },
  {
    id: 19,
    firstName: 'Quentin',
    lastName: 'ResaConfluent',
    email: 'quentin.resa.confluent@example.com',
    password: 'password123',
    role: UserRole.RESERVATION_SERVICE,
    structureId: 10, // Espace Événementiel "Le Confluent"
    createdAt: addDays(today, -10),
    updatedAt: addDays(today, -1),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user19/200/200`,
    mockToken: `mock_token_quentin_resa_confluent_${Date.now()}`
  },
  {
    id: 20,
    firstName: 'Sophie',
    lastName: 'AdminNovaArena',
    email: 'sophie.admin.nova@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 11, // Site en Développement "Nova Arena"
    createdAt: addDays(today, -7),
    updatedAt: addDays(today, -1),
    needsStructureSetup: true,
    avatarUrl: `https://picsum.photos/seed/user20/200/200`,
    mockToken: `mock_token_sophie_admin_nova_${Date.now()}`
  },
  {
    id: 21,
    firstName: 'Thomas',
    lastName: 'OrgaCafeConcert',
    email: 'thomas.orga.cafe@example.com',
    password: 'password123',
    role: UserRole.ORGANIZATION_SERVICE,
    structureId: 12, // Le Petit Café Intime
    createdAt: addDays(today, -6),
    updatedAt: addDays(today, -1),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user21/200/200`,
    mockToken: `mock_token_thomas_orga_cafe_${Date.now()}`
  },
  {
    id: 22,
    firstName: 'Ursula',
    lastName: 'AdminPlage',
    email: 'ursula.admin.plage@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 13, // Plage des Corsaires
    createdAt: addDays(today, -4),
    updatedAt: addDays(today, -1),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user22/200/200`,
    mockToken: `mock_token_ursula_admin_plage_${Date.now()}`
  },
  {
    id: 23,
    firstName: 'Victor',
    lastName: 'ResaLibrairie',
    email: 'victor.resa.librairie@example.com',
    password: 'password123',
    role: UserRole.RESERVATION_SERVICE,
    structureId: 14, // Librairie "L'Encre et la Plume"
    createdAt: addDays(today, -3),
    updatedAt: addDays(today, -1),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user23/200/200`,
    mockToken: `mock_token_victor_resa_librairie_${Date.now()}`
  },
  {
    id: 24,
    firstName: 'Wendy',
    lastName: 'AdminCiteBD',
    email: 'wendy.admin.bd@example.com',
    password: 'password123',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 15, // Angoulême - Cité de la BD
    createdAt: addDays(today, -2),
    updatedAt: addDays(today, -1),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user24/200/200`,
    mockToken: `mock_token_wendy_admin_bd_${Date.now()}`
  },
  {
    id: 25,
    firstName: 'Xavier',
    lastName: 'OrgaParcNational',
    email: 'xavier.orga.parc@example.com',
    password: 'password123',
    role: UserRole.ORGANIZATION_SERVICE,
    structureId: 16, // Parc National des Calanques
    createdAt: addDays(today, -1),
    updatedAt: addDays(today, -0),
    needsStructureSetup: false,
    avatarUrl: `https://picsum.photos/seed/user25/200/200`,
    mockToken: `mock_token_xavier_orga_parc_${Date.now()}`
  }
];
