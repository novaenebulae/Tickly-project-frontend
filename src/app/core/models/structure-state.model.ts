import { StructureModel } from './structure/structure.model';
import { StructureTypeModel } from './structure/structure-type.model';

/**
 * Interface pour représenter l'état global des structures
 */
export interface StructureState {
  structures: StructureModel[];
  filteredStructures: StructureModel[];
  selectedStructure: StructureModel | null;
  structureTypes: StructureTypeModel[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currentFilters: {
    query?: string;
    typeIds?: number[];
    location?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
}
