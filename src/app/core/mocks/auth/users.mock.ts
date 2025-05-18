// src/app/core/mocks/auth/users.mock.ts

/**
 * Interface pour les utilisateurs mockés avec toutes les propriétés nécessaires
 * pour simuler les fonctionnalités d'authentification
 */
export interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  structureId?: number;
  mockToken: string;
  needsStructureSetup?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Liste des utilisateurs mockés pour les tests et le développement
 */
export const mockUsers: MockUser[] = [
  // Administrateurs de structure
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'Principal',
    email: 'admin@example.com',
    password: 'rootroot',
    role: 'STRUCTURE_ADMINISTRATOR',
    structureId: 1,
    mockToken: 'mock_token_admin_1_structure_1',
    needsStructureSetup: false,
    createdAt: new Date('2025-01-01T10:00:00'),
    updatedAt: new Date('2025-01-01T10:00:00')
  },
  {
    id: 2,
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@example.com',
    password: 'password123',
    role: 'STRUCTURE_ADMINISTRATOR',
    structureId: 2,
    mockToken: 'mock_token_admin_2_structure_2',
    needsStructureSetup: false,
    createdAt: new Date('2025-01-05T11:30:00'),
    updatedAt: new Date('2025-01-05T11:30:00')
  },
  {
    id: 3,
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@example.com',
    password: 'password123',
    role: 'STRUCTURE_ADMINISTRATOR',
    structureId: 3,
    mockToken: 'mock_token_admin_3_structure_3',
    needsStructureSetup: false,
    createdAt: new Date('2025-01-10T09:45:00'),
    updatedAt: new Date('2025-01-10T09:45:00')
  },
  {
    id: 4,
    firstName: 'Sophie',
    lastName: 'Petit',
    email: 'sophie.petit@example.com',
    password: 'password123',
    role: 'STRUCTURE_ADMINISTRATOR',
    mockToken: 'mock_token_admin_4_no_structure',
    needsStructureSetup: true, // N'a pas encore configuré sa structure
    createdAt: new Date('2025-01-15T14:20:00'),
    updatedAt: new Date('2025-01-15T14:20:00')
  },
  {
    id: 5,
    firstName: 'Pierre',
    lastName: 'Leroy',
    email: 'pierre.leroy@example.com',
    password: 'password123',
    role: 'STRUCTURE_ADMINISTRATOR',
    structureId: 5,
    mockToken: 'mock_token_admin_5_structure_5',
    needsStructureSetup: false,
    createdAt: new Date('2025-01-20T16:10:00'),
    updatedAt: new Date('2025-01-20T16:10:00')
  },

  // Spectateurs
  {
    id: 6,
    firstName: 'Lucie',
    lastName: 'Moreau',
    email: 'lucie.moreau@example.com',
    password: 'password123',
    role: 'SPECTATOR',
    mockToken: 'mock_token_spectator_1',
    createdAt: new Date('2025-02-01T09:00:00'),
    updatedAt: new Date('2025-02-01T09:00:00')
  },
  {
    id: 7,
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas.bernard@example.com',
    password: 'password123',
    role: 'SPECTATOR',
    mockToken: 'mock_token_spectator_2',
    createdAt: new Date('2025-02-05T10:30:00'),
    updatedAt: new Date('2025-02-05T10:30:00')
  },
  {
    id: 8,
    firstName: 'Emma',
    lastName: 'Robert',
    email: 'emma.robert@example.com',
    password: 'password123',
    role: 'SPECTATOR',
    mockToken: 'mock_token_spectator_3',
    createdAt: new Date('2025-02-10T14:15:00'),
    updatedAt: new Date('2025-02-10T14:15:00')
  },
  {
    id: 9,
    firstName: 'Lucas',
    lastName: 'Dubois',
    email: 'lucas.dubois@example.com',
    password: 'password123',
    role: 'SPECTATOR',
    mockToken: 'mock_token_spectator_4',
    createdAt: new Date('2025-02-15T11:45:00'),
    updatedAt: new Date('2025-02-15T11:45:00')
  },
  {
    id: 10,
    firstName: 'Chloé',
    lastName: 'Girard',
    email: 'chloe.girard@example.com',
    password: 'password123',
    role: 'SPECTATOR',
    mockToken: 'mock_token_spectator_5',
    createdAt: new Date('2025-02-20T15:30:00'),
    updatedAt: new Date('2025-02-20T15:30:00')
  },

  // Administrateurs de plateforme
  {
    id: 11,
    firstName: 'Nicolas',
    lastName: 'Roux',
    email: 'nicolas.roux@example.com',
    password: 'admin_secure',
    role: 'PLATFORM_ADMINISTRATOR',
    mockToken: 'mock_token_platform_admin_1',
    createdAt: new Date('2025-01-01T08:00:00'),
    updatedAt: new Date('2025-01-01T08:00:00')
  },
  {
    id: 12,
    firstName: 'Céline',
    lastName: 'Fournier',
    email: 'celine.fournier@example.com',
    password: 'admin_secure',
    role: 'PLATFORM_ADMINISTRATOR',
    mockToken: 'mock_token_platform_admin_2',
    createdAt: new Date('2025-01-02T08:30:00'),
    updatedAt: new Date('2025-01-02T08:30:00')
  },

  // Gestionnaires d'événements (rôle spécifique pour les membres des structures)
  {
    id: 13,
    firstName: 'Alexandre',
    lastName: 'Vincent',
    email: 'alexandre.vincent@example.com',
    password: 'password123',
    role: 'EVENT_MANAGER',
    structureId: 1,
    mockToken: 'mock_token_event_manager_1',
    createdAt: new Date('2025-03-01T09:15:00'),
    updatedAt: new Date('2025-03-01T09:15:00')
  },
  {
    id: 14,
    firstName: 'Julie',
    lastName: 'Simon',
    email: 'julie.simon@example.com',
    password: 'password123',
    role: 'EVENT_MANAGER',
    structureId: 2,
    mockToken: 'mock_token_event_manager_2',
    createdAt: new Date('2025-03-05T10:45:00'),
    updatedAt: new Date('2025-03-05T10:45:00')
  },

  // Billetterie (rôle pour gérer les entrées aux événements)
  {
    id: 15,
    firstName: 'Mathieu',
    lastName: 'Lambert',
    email: 'mathieu.lambert@example.com',
    password: 'password123',
    role: 'TICKETING',
    structureId: 1,
    mockToken: 'mock_token_ticketing_1',
    createdAt: new Date('2025-03-10T11:00:00'),
    updatedAt: new Date('2025-03-10T11:00:00')
  },
  {
    id: 16,
    firstName: 'Audrey',
    lastName: 'Laurent',
    email: 'audrey.laurent@example.com',
    password: 'password123',
    role: 'TICKETING',
    structureId: 3,
    mockToken: 'mock_token_ticketing_2',
    createdAt: new Date('2025-03-15T13:30:00'),
    updatedAt: new Date('2025-03-15T13:30:00')
  },

  // Utilisateurs supplémentaires variés
  {
    id: 17,
    firstName: 'Hugo',
    lastName: 'Marchand',
    email: 'hugo.marchand@example.com',
    password: 'password123',
    role: 'SPECTATOR',
    mockToken: 'mock_token_spectator_6',
    createdAt: new Date('2025-04-01T10:00:00'),
    updatedAt: new Date('2025-04-01T10:00:00')
  },
  {
    id: 18,
    firstName: 'Inès',
    lastName: 'Lefebvre',
    email: 'ines.lefebvre@example.com',
    password: 'password123',
    role: 'SPECTATOR',
    mockToken: 'mock_token_spectator_7',
    createdAt: new Date('2025-04-05T11:15:00'),
    updatedAt: new Date('2025-04-05T11:15:00')
  },
  {
    id: 19,
    firstName: 'Léo',
    lastName: 'Mercier',
    email: 'leo.mercier@example.com',
    password: 'password123',
    role: 'STRUCTURE_ADMINISTRATOR',
    structureId: 6,
    mockToken: 'mock_token_admin_6_structure_6',
    needsStructureSetup: false,
    createdAt: new Date('2025-04-10T14:00:00'),
    updatedAt: new Date('2025-04-10T14:00:00')
  },
  {
    id: 20,
    firstName: 'Camille',
    lastName: 'Blanchard',
    email: 'camille.blanchard@example.com',
    password: 'password123',
    role: 'STRUCTURE_ADMINISTRATOR',
    mockToken: 'mock_token_admin_7_no_structure',
    needsStructureSetup: true, // N'a pas encore configuré sa structure
    createdAt: new Date('2025-04-15T16:30:00'),
    updatedAt: new Date('2025-04-15T16:30:00')
  }
];
