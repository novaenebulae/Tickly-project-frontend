// src/app/core/mocks/structures/structure-types.mock.ts

import { StructureTypeModel } from '../../models/structure/structure-type.model';

/**
 * Liste des types de structures mockés pour le développement et les tests
 */
export const mockStructureTypes: StructureTypeModel[] = [
  {
    id: 1,
    type: 'Salle de concert'
  },
  {
    id: 2,
    type: 'Théâtre'
  },
  {
    id: 3,
    type: 'Centre de conférence'
  },
  {
    id: 4,
    type: 'Espace polyvalent'
  },
  {
    id: 5,
    type: 'Bar / Club'
  },
  {
    id: 6,
    type: 'Cinéma'
  },
  {
    id: 7,
    type: 'Musée'
  },
  {
    id: 8,
    type: 'Galerie d\'art'
  },
  {
    id: 9,
    type: 'Centre culturel'
  },
  {
    id: 10,
    type: 'Stade'
  },
  {
    id: 11,
    type: 'Complexe sportif'
  },
  {
    id: 12,
    type: 'Lieu historique'
  },
  {
    id: 13,
    type: 'Association culturelle'
  },
  {
    id: 14,
    type: 'École d\'art'
  },
  {
    id: 99,
    type: 'Autre'
  }
];

/**
 * Helper function pour trouver un type de structure par ID
 */
export function findStructureTypeById(id: number): StructureTypeModel | undefined {
  return mockStructureTypes.find(type => type.id === id);
}

/**
 * Helper function pour trouver un type de structure par nom
 */
export function findStructureTypeByName(name: string): StructureTypeModel | undefined {
  return mockStructureTypes.find(type => type.type.toLowerCase() === name.toLowerCase());
}

/**
 * Helper function pour récupérer plusieurs types de structure par IDs
 */
export function getStructureTypesByIds(ids: number[]): StructureTypeModel[] {
  return mockStructureTypes.filter(type => ids.includes(type.id));
}
