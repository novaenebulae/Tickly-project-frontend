import { StructureModel } from '../structure/structure.model';

/**
 * Représente une structure favorite de l'utilisateur, telle que retournée par l'API.
 * Inclut l'objet complet de la structure.
 */
export interface UserFavoriteStructureModel {
  id: number;
  userId: number;
  structure: StructureModel; // L'objet structure est maintenant directement inclus et non optionnel
  addedAt: Date;
}

/**
 * DTO pour l'ajout d'une structure aux favoris.
 */
export interface FavoriteStructureDto {
  structureId: number;
}
