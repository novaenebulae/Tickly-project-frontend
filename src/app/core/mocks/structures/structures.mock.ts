// src/app/core/mocks/structures/structures.mock.ts

import {StructureModel} from '../../models/structure/structure.model';
import {mockStructureTypes} from './structure-types.mock';
import {mockAreas} from './areas.mock';
import {getAreasByStructureId} from './areas.mock';

/**
 * Liste des structures mockées pour le développement et les tests
 */
export const mockStructures: StructureModel[] = [
  // Structure 1: Salle de concert
  {
    id: 1,
    name: 'Le Zénith',
    types: [mockStructureTypes.find(t => t.id === 1)!],
    description: 'Grande salle de concert pouvant accueillir jusqu\'à 7000 personnes. Programmation variée incluant concerts, spectacles et événements sportifs.',
    address: {
      country: 'France',
      city: 'Paris',
      street: 'Avenue Corentin Cariou',
      number: '211',
      zipCode: '75019'
    },
    phone: '+33 1 44 52 54 56',
    email: 'contact@lezenith.fr',
    websiteUrl: 'https://www.lezenith.fr',
    socialsUrl: [
      'https://www.facebook.com/lezenithparis',
      'https://www.instagram.com/lezenithparis',
      'https://twitter.com/zenith_paris'
    ],
    logoUrl: 'https://example.com/logos/zenith.png',
    createdAt: new Date('2023-01-15T10:30:00'),
    updatedAt: new Date('2023-06-12T14:45:00'),
    importance: 85 // Score d'importance élevé (grande salle parisienne)
  },

  // Structure 2: Théâtre
  {
    id: 2,
    name: 'Théâtre de la Ville',
    types: [mockStructureTypes.find(t => t.id === 2)!],
    description: 'Théâtre historique offrant une programmation de théâtre contemporain, danse et musique du monde.',
    address: {
      country: 'France',
      city: 'Paris',
      street: 'Place du Châtelet',
      number: '2',
      zipCode: '75004'
    },
    phone: '+33 1 42 74 22 77',
    email: 'info@theatredelaville.com',
    websiteUrl: 'https://www.theatredelaville-paris.com',
    socialsUrl: [
      'https://www.facebook.com/TheatredelaVille.Paris',
      'https://www.instagram.com/theatredelaville'
    ],
    logoUrl: 'https://example.com/logos/theatre-ville.png',
    createdAt: new Date('2023-02-20T09:15:00'),
    updatedAt: new Date('2023-07-05T11:30:00'),
    importance: 72 // Score d'importance moyen-élevé
  },

  // Structure 3: Centre de conférence
  {
    id: 3,
    name: 'Centre des Congrès',
    types: [mockStructureTypes.find(t => t.id === 3)!],
    description: 'Espace moderne pour conférences, séminaires et événements professionnels avec équipements audiovisuels de pointe.',
    address: {
      country: 'France',
      city: 'Lyon',
      street: 'Quai Charles de Gaulle',
      number: '50',
      zipCode: '69006'
    },
    phone: '+33 4 72 82 26 26',
    email: 'contact@ccc-lyon.com',
    websiteUrl: 'https://www.ccc-lyon.com',
    socialsUrl: [
      'https://www.linkedin.com/company/centre-congres-lyon',
      'https://twitter.com/CongresCentre'
    ],
    logoUrl: 'https://example.com/logos/congres-lyon.png',
    createdAt: new Date('2023-03-10T11:00:00'),
    updatedAt: new Date('2023-09-18T16:20:00'),
    importance: 68 // Score d'importance moyen-élevé
  },

  // Structure 4: Espace polyvalent
  {
    id: 4,
    name: 'La Cité des Arts',
    types: [
      mockStructureTypes.find(t => t.id === 4)!,
      mockStructureTypes.find(t => t.id === 9)!
    ],
    description: 'Centre culturel polyvalent proposant expositions, spectacles, ateliers et espaces de création pour artistes.',
    address: {
      country: 'France',
      city: 'Montpellier',
      street: 'Boulevard Louis Blanc',
      number: '25',
      zipCode: '34000'
    },
    phone: '+33 4 67 60 82 42',
    email: 'accueil@cite-arts.fr',
    websiteUrl: 'https://www.cite-arts-montpellier.fr',
    socialsUrl: [
      'https://www.facebook.com/citedesartsmontpellier',
      'https://www.instagram.com/cite_arts'
    ],
    logoUrl: 'https://example.com/logos/cite-arts.png',
    createdAt: new Date('2023-04-05T14:30:00'),
    updatedAt: new Date('2023-10-22T09:45:00'),
    importance: 55 // Score d'importance moyen
  },

  // Structure 5: Bar / Club
  {
    id: 5,
    name: 'Le Dôme',
    types: [mockStructureTypes.find(t => t.id === 5)!],
    description: 'Club branché proposant concerts live et soirées DJ dans une ambiance industrielle.',
    address: {
      country: 'France',
      city: 'Marseille',
      street: 'Rue Augustin Daumas',
      number: '12',
      zipCode: '13009'
    },
    phone: '+33 4 91 12 21 21',
    email: 'info@ledomemarseille.com',
    websiteUrl: 'https://www.ledomemarseille.com',
    socialsUrl: [
      'https://www.facebook.com/ledomemarseille',
      'https://www.instagram.com/ledome_marseille'
    ],
    logoUrl: 'https://example.com/logos/dome-marseille.png',
    createdAt: new Date('2023-05-18T16:45:00'),
    updatedAt: new Date('2023-11-03T22:15:00'),
    importance: 40 // Score d'importance moyen-faible
  },

  // Structure 6: Cinéma
  {
    id: 6,
    name: 'Cinéma Lumière',
    types: [mockStructureTypes.find(t => t.id === 6)!],
    description: 'Cinéma art et essai proposant films indépendants et cycles thématiques.',
    address: {
      country: 'France',
      city: 'Bordeaux',
      street: 'Rue Georges Bonnac',
      number: '5',
      zipCode: '33000'
    },
    phone: '+33 5 56 46 06 55',
    email: 'cinema@lumierebordeaux.fr',
    websiteUrl: 'https://www.cinema-lumiere.com',
    socialsUrl: [
      'https://www.facebook.com/cinemalumiere',
      'https://twitter.com/Cinema_Lumiere'
    ],
    logoUrl: 'https://example.com/logos/cinema-lumiere.png',
    createdAt: new Date('2023-06-22T10:20:00'),
    updatedAt: new Date('2023-12-15T13:40:00'),
    importance: 35 // Score d'importance faible
  },

  // Structure 7: Musée
  {
    id: 7,
    name: 'Musée d\'Art Contemporain',
    types: [mockStructureTypes.find(t => t.id === 7)!],
    description: 'Collection permanente d\'œuvres contemporaines et expositions temporaires d\'artistes internationaux.',
    address: {
      country: 'France',
      city: 'Strasbourg',
      street: 'Place Hans-Jean Arp',
      number: '1',
      zipCode: '67000'
    },
    phone: '+33 3 88 23 31 31',
    email: 'info@mac-strasbourg.eu',
    websiteUrl: 'https://www.mac-strasbourg.eu',
    socialsUrl: [
      'https://www.facebook.com/MACstrasbourg',
      'https://www.instagram.com/mac_strasbourg'
    ],
    logoUrl: 'https://example.com/logos/mac-strasbourg.png',
    createdAt: new Date('2023-07-14T09:00:00'),
    updatedAt: new Date('2024-01-10T11:25:00'),
    importance: 50 // Score d'importance moyen
  }
];

// Ajouter les zones aux structures
mockStructures.forEach(structure => {
  structure.areas = getAreasByStructureId(structure.id!);
});

/**
 * Helper function pour trouver une structure par ID
 */
export function findStructureById(id: number): StructureModel | undefined {
  return mockStructures.find(structure => structure.id === id);
}

/**
 * Helper function pour trouver des structures par type
 */
export function findStructuresByType(typeId: number): StructureModel[] {
  return mockStructures.filter(structure =>
    structure.types.some(type => type.id === typeId)
  );
}

/**
 * Helper function pour trouver des structures par ville
 */
export function findStructuresByCity(city: string): StructureModel[] {
  return mockStructures.filter(structure =>
    structure.address.city.toLowerCase() === city.toLowerCase()
  );
}

/**
 * Helper function pour rechercher des structures par nom ou description
 */
export function searchStructures(query: string): StructureModel[] {
  const searchTerm = query.toLowerCase();
  return mockStructures.filter(structure =>
    structure.name.toLowerCase().includes(searchTerm) ||
    (structure.description && structure.description.toLowerCase().includes(searchTerm))
  );
}

/**
 * Helper function pour filtrer les structures avec des critères multiples
 */
export function filterStructures({
                                   query,
                                   typeIds,
                                   city,
                                   hasActiveAreas,
                                   minImportance,
                                   maxImportance,
                                   location
                                 }: {
  query?: string;
  typeIds?: number[];
  city?: string;
  hasActiveAreas?: boolean;
  minImportance?: number;
  maxImportance?: number;
  location?: string;
}): StructureModel[] {
  let filtered = [...mockStructures];

  // Filtre par terme de recherche
  if (query) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(structure =>
      structure.name.toLowerCase().includes(searchTerm) ||
      (structure.description && structure.description.toLowerCase().includes(searchTerm))
    );
  }

  // Filtre par types
  if (typeIds && typeIds.length > 0) {
    filtered = filtered.filter(structure =>
      structure.types.some(type => typeIds.includes(type.id))
    );
  }

  // Filtre par ville
  if (city) {
    filtered = filtered.filter(structure =>
      structure.address.city.toLowerCase() === city.toLowerCase()
    );
  }

  // Filtre par localisation (plus flexible que le filtre par ville)
  if (location) {
    const searchLocation = location.toLowerCase();
    filtered = filtered.filter(structure =>
      structure.address.city.toLowerCase().includes(searchLocation) ||
      structure.address.country.toLowerCase().includes(searchLocation) ||
      (structure.address.zipCode && structure.address.zipCode.toLowerCase().includes(searchLocation)) ||
      (structure.address.street && structure.address.street.toLowerCase().includes(searchLocation))
    );
  }

  // Filtre par zones actives
  if (hasActiveAreas !== undefined) {
    filtered = filtered.filter(structure => {
      const hasActive = structure.areas?.some(area => area.isActive);
      return hasActiveAreas ? hasActive : !hasActive;
    });
  }

  // Filtre par importance minimale
  if (minImportance !== undefined) {
    filtered = filtered.filter(structure =>
      (structure.importance !== undefined && structure.importance >= minImportance)
    );
  }

  // Filtre par importance maximale
  if (maxImportance !== undefined) {
    filtered = filtered.filter(structure =>
      (structure.importance !== undefined && structure.importance <= maxImportance)
    );
  }

  return filtered;
}

/**
 * Helper function pour trier les structures
 */
export function sortStructures(
  structures: StructureModel[],
  sortBy: keyof StructureModel | 'city' | 'importance',
  sortDirection: 'asc' | 'desc' = 'asc'
): StructureModel[] {
  const direction = sortDirection === 'desc' ? -1 : 1;

  return [...structures].sort((a, b) => {
    let valA: any = undefined;
    let valB: any = undefined;

    // Cas spécial pour trier par ville (qui est dans l'objet address)
    if (sortBy === 'city') {
      valA = a.address.city.toLowerCase();
      valB = b.address.city.toLowerCase();
    }
    // Cas spécial pour trier par importance (gérer les undefined)
    else if (sortBy === 'importance') {
      valA = a.importance !== undefined ? a.importance : 0;
      valB = b.importance !== undefined ? b.importance : 0;
    }
    else {
      valA = a[sortBy as keyof StructureModel];
      valB = b[sortBy as keyof StructureModel];

      // Traitement pour les chaînes de caractères (ignorer casse)
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
      }
      if (typeof valB === 'string') {
        valB = valB.toLowerCase();
      }

      // Traitement pour les dates
      if (valA instanceof Date && valB instanceof Date) {
        return ((valA as Date).getTime() - (valB as Date).getTime()) * direction;
      }
    }

    // Gestion des valeurs undefined ou null
    if (valA === undefined || valA === null) return 1 * direction;
    if (valB === undefined || valB === null) return -1 * direction;

    // Comparaison standard
    if (valA < valB) return -1 * direction;
    if (valA > valB) return 1 * direction;
    return 0;
  });
}

/**
 * Helper function pour récupérer des structures avec pagination
 */
export function getPaginatedStructures(
  structures: StructureModel[],
  page: number = 0,
  pageSize: number = 10
): StructureModel[] {
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  return structures.slice(startIndex, endIndex);
}

/**
 * Helper function pour récupérer les structures récemment créées
 */
export function getRecentStructures(count: number = 5): StructureModel[] {
  return [...mockStructures]
    .sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, count);
}

/**
 * Helper function pour récupérer les structures récemment mises à jour
 */
export function getRecentlyUpdatedStructures(count: number = 5): StructureModel[] {
  return [...mockStructures]
    .sort((a, b) => {
      const dateA = a.updatedAt ? a.updatedAt.getTime() : 0;
      const dateB = b.updatedAt ? b.updatedAt.getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, count);
}

/**
 * Helper function pour récupérer les structures les plus importantes
 */
export function getMostImportantStructures(count: number = 5): StructureModel[] {
  return [...mockStructures]
    .sort((a, b) => {
      const importanceA = a.importance !== undefined ? a.importance : 0;
      const importanceB = b.importance !== undefined ? b.importance : 0;
      return importanceB - importanceA; // Tri par ordre décroissant
    })
    .slice(0, count);
}
