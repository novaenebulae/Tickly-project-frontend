// src/app/core/models/structure/structure-type.model.ts

/**
 * Represents a type or category of a structure.
 * @example { id: 1, name: "Salle de concert" }
 */
export interface StructureTypeModel {
  /**
   * The unique identifier for the structure type.
   */
  id: number;

  /**
   * The name of the structure type.
   * @example "Théâtre", "Stade", "Musée"
   */
  name: string;

  icon: string;
}
