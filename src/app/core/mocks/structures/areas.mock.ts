import { StructureAreaModel } from '../../models/structure/structure-area.model';
import {mockAreas} from './data/areas-data.mock';

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
