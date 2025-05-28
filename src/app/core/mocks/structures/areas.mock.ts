import { StructureAreaModel } from '../../models/structure/structure-area.model';

/**
 * Liste des zones (espaces) mockées pour le développement et les tests
 */
export const mockAreas: StructureAreaModel[] = [
  // Zones pour la structure 1
  {
    id: 1001,
    structureId: 1,
    name: 'Grande Salle',
    description: 'Salle principale avec scène et gradins',
    maxCapacity: 800,
    isActive: true
  },
  {
    id: 1002,
    structureId: 1,
    name: 'Petit Auditorium',
    description: 'Salle intime pour concerts et présentations',
    maxCapacity: 150,
    isActive: true
  },
  {
    id: 1003,
    structureId: 1,
    name: 'Foyer',
    description: 'Espace d\'accueil et de réception',
    maxCapacity: 200,
    isActive: true
  },

  // Zones pour la structure 2
  {
    id: 2001,
    structureId: 2,
    name: 'Scène principale',
    description: 'Grande scène avec coulisses',
    maxCapacity: 500,
    isActive: true
  },
  {
    id: 2002,
    structureId: 2,
    name: 'Salle de répétition',
    description: 'Espace pour les répétitions',
    maxCapacity: 30,
    isActive: false
  },

  // Zones pour la structure 3
  {
    id: 3001,
    structureId: 3,
    name: 'Salle de conférence A',
    description: 'Grande salle équipée pour conférences et présentations',
    maxCapacity: 300,
    isActive: true
  },
  {
    id: 3002,
    structureId: 3,
    name: 'Salle de conférence B',
    description: 'Salle moyenne pour ateliers et réunions',
    maxCapacity: 150,
    isActive: true
  },
  {
    id: 3003,
    structureId: 3,
    name: 'Espace de restauration',
    description: 'Zone de pause et restauration',
    maxCapacity: 100,
    isActive: true
  },

  // Zones pour la structure 4
  {
    id: 4001,
    structureId: 4,
    name: 'Grande salle polyvalente',
    description: 'Espace modulable pour différents types d\'événements',
    maxCapacity: 600,
    isActive: true
  },
  {
    id: 4002,
    structureId: 4,
    name: 'Salle d\'exposition',
    description: 'Espace dédié aux expositions temporaires',
    maxCapacity: 200,
    isActive: true
  },

  // Zones pour la structure 5
  {
    id: 5001,
    structureId: 5,
    name: 'Piste de danse',
    description: 'Espace central avec système son',
    maxCapacity: 200,
    isActive: true
  },
  {
    id: 5002,
    structureId: 5,
    name: 'Lounge VIP',
    description: 'Espace privé avec service personnalisé',
    maxCapacity: 50,
    isActive: true
  },
  {
    id: 5003,
    structureId: 5,
    name: 'Bar principal',
    description: 'Zone de bar avec comptoir et tabourets',
    maxCapacity: 80,
    isActive: true
  },

  // Zone désactivée (pour tester les filtres d'état)
  {
    id: 6001,
    structureId: 6,
    name: 'Salle en rénovation',
    description: 'Espace temporairement fermé pour travaux',
    maxCapacity: 300,
    isActive: false
  }
];

/**
 * Helper function pour trouver une zone par ID
 */
export function findAreaById(id: number): StructureAreaModel | undefined {
  return mockAreas.find(area => area.id === id);
}

/**
 * Helper function pour récupérer toutes les zones d'une structure
 */
export function getAreasByStructureId(structureId: number): StructureAreaModel[] {
  return mockAreas.filter(area => area.structureId === structureId);
}

/**
 * Helper function pour récupérer les zones actives d'une structure
 */
export function getActiveAreasByStructureId(structureId: number): StructureAreaModel[] {
  return mockAreas.filter(area => area.structureId === structureId && area.isActive);
}

/**
 * Helper function pour récupérer la capacité totale des zones actives d'une structure
 */
export function getTotalCapacityForStructure(structureId: number): number {
  return getActiveAreasByStructureId(structureId)
    .reduce((total, area) => total + area.maxCapacity, 0);
}
