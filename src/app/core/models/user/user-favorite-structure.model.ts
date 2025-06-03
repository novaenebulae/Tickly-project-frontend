// models/user/user-favorite-structure.model.ts
import {StructureModel} from '../structure/structure.model';

export interface UserFavoriteStructureModel {
  id: number;
  userId: number;
  structureId: number;
  addedAt: Date;
  structure?: StructureModel; // Relation optionnelle pour les jointures
}

// DTO pour les opérations API
export interface FavoriteStructureDto {
  structureId: number;
}
