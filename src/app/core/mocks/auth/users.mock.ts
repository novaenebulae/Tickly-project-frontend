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
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fonction utilitaire pour créer un token JWT valide à partir des données utilisateur
 */
function createMockJwt(userData: {
  sub: string;
  userId: number;
  role: string;
  needsStructureSetup?: boolean;
}): string {
  // Création du header JWT (alg + typ)
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // Création du payload avec les données utilisateur et timestamps
  const payload = {
    ...userData,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 * 24 // Expire dans 24h
  };

  // Encodage en base64 des parties (normalement il y aurait une signature)
  const headerEncoded = btoa(JSON.stringify(header)).replace(/=/g, '');
  const payloadEncoded = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const signatureEncoded = 'mockSignature123'; // Signature fictive

  // Construction du token JWT
  return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
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
    mockToken: createMockJwt({
      sub: 'admin@example.com',
      userId: 1,
      role: 'STRUCTURE_ADMINISTRATOR',
      needsStructureSetup: false
    }),
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
    mockToken: createMockJwt({
      sub: 'marie.dupont@example.com',
      userId: 2,
      role: 'STRUCTURE_ADMINISTRATOR',
      needsStructureSetup: false
    }),
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
    mockToken: createMockJwt({
      sub: 'jean.martin@example.com',
      userId: 3,
      role: 'STRUCTURE_ADMINISTRATOR',
      needsStructureSetup: false
    }),
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
    mockToken: createMockJwt({
      sub: 'sophie.petit@example.com',
      userId: 4,
      role: 'STRUCTURE_ADMINISTRATOR',
      needsStructureSetup: true
    }),
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
    mockToken: createMockJwt({
      sub: 'pierre.leroy@example.com',
      userId: 5,
      role: 'STRUCTURE_ADMINISTRATOR',
      needsStructureSetup: false
    }),
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
    mockToken: createMockJwt({
      sub: 'lucie.moreau@example.com',
      userId: 6,
      role: 'SPECTATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'thomas.bernard@example.com',
      userId: 7,
      role: 'SPECTATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'emma.robert@example.com',
      userId: 8,
      role: 'SPECTATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'lucas.dubois@example.com',
      userId: 9,
      role: 'SPECTATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'chloe.girard@example.com',
      userId: 10,
      role: 'SPECTATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'nicolas.roux@example.com',
      userId: 11,
      role: 'PLATFORM_ADMINISTRATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'celine.fournier@example.com',
      userId: 12,
      role: 'PLATFORM_ADMINISTRATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'alexandre.vincent@example.com',
      userId: 13,
      role: 'EVENT_MANAGER'
    }),
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
    mockToken: createMockJwt({
      sub: 'julie.simon@example.com',
      userId: 14,
      role: 'EVENT_MANAGER'
    }),
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
    mockToken: createMockJwt({
      sub: 'mathieu.lambert@example.com',
      userId: 15,
      role: 'TICKETING'
    }),
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
    mockToken: createMockJwt({
      sub: 'audrey.laurent@example.com',
      userId: 16,
      role: 'TICKETING'
    }),
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
    mockToken: createMockJwt({
      sub: 'hugo.marchand@example.com',
      userId: 17,
      role: 'SPECTATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'ines.lefebvre@example.com',
      userId: 18,
      role: 'SPECTATOR'
    }),
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
    mockToken: createMockJwt({
      sub: 'leo.mercier@example.com',
      userId: 19,
      role: 'STRUCTURE_ADMINISTRATOR',
      needsStructureSetup: false
    }),
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
    mockToken: createMockJwt({
      sub: 'camille.blanchard@example.com',
      userId: 20,
      role: 'STRUCTURE_ADMINISTRATOR',
      needsStructureSetup: true
    }),
    needsStructureSetup: true, // N'a pas encore configuré sa structure
    createdAt: new Date('2025-04-15T16:30:00'),
    updatedAt: new Date('2025-04-15T16:30:00')
  }
];
