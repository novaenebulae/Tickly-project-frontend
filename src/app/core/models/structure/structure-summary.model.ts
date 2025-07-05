import {StructureTypeModel} from './structure-type.model';

/**
 * Représente un résumé de structure, utilisé dans les listes et les favoris.
 * C'est l'équivalent frontend du `StructureSummaryDto`.
 */
export interface StructureSummaryModel {
  id: number;
  name: string;
  types: StructureTypeModel[];
  city: string;
  logoUrl?: string;
  coverUrl?: string;
  isActive: boolean;
  eventCount?: number;
}
