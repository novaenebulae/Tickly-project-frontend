// src/app/core/models/structure/area.model.ts
export interface AreaModel {
  id: number;
  name: string;           // Ex: "Salle A", "Grande Scène", etc.
  maxCapacity: number;    // Capacité maximale de la zone
  isActive: boolean;      // Si la zone est disponible pour des événements
  structureId?: number;   // À quelle structure appartient cette zone
  description?: string;   // Description optionnelle de la zone
}
