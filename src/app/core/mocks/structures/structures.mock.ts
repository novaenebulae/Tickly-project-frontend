import { StructureSearchParams } from '../../models/structure/structure-search-params.model';
import { MockApiStructureDto } from './data/structure-data.mock';
import { mockStructures } from './data/structure-data.mock';
import { StructureAreaModel } from '../../models/structure/structure-area.model';

// Optionnel : Si vous avez besoin de fonctions de filtrage complexes pour les structures
// export function getFilteredMockStructures(allStructures: MockApiStructureDto[], filters: Partial<StructureSearchParams>): MockApiStructureDto[] {
//   let results = [...allStructures];
//   // Implémentez la logique de filtrage basée sur StructureSearchParams
//   // (query, typeIds, location, etc.)
//   if (filters.query) {
//       const query = filters.query.toLowerCase();
//       results = results.filter(s => s.name.toLowerCase().includes(query) || (s.description && s.description.toLowerCase().includes(query)));
//   }
//   if (filters.typeIds && filters.typeIds.length > 0) {
//       results = results.filter(s => s.types.some(t => filters.typeIds!.includes(t.id)));
//   }
//   // ... autres filtres ...
//   return results;
// }

// export function getMockStructureByIdWithAreas(structureId: number): MockApiStructureDto | undefined {
//   const structure = mockStructures.find(s => s.id === structureId);
//   if (structure) {
//     const areasForStructure = mockAreas.filter(a => a.structureId === structureId);
//     return { ...structure, areas: areasForStructure }; // Si l'API retourne les aires avec la structure
//   }
//   return undefined;
// }
