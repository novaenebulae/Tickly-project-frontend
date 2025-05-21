// src/app/core/mocks/structures/structures.mock.ts

import {StructureModel} from '../../models/structure/structure.model';
import {mockStructures} from './mockStructuresData';


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
