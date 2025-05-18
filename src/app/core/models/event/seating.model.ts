// src/app/core/models/event/seating.model.ts
// Types de placement possible
export enum SeatingType {
  SEATED = 'seated',      // Places assises avec attribution de siège
  STANDING = 'standing',  // Placement libre debout
  MIXED = 'mixed'         // Combinaison des deux
}

// Zone de placement pour un événement spécifique
export interface EventSeatingZone {
  id?: number;
  name: string;           // Ex: "Carré VIP", "Fosse", "Balcon"
  areaId: number;         // Référence à la zone de la structure
  maxCapacity: number;    // Capacité maximale de cette zone de placement
  ticketPrice: number;    // Prix du billet pour cette zone
  isActive: boolean;      // Si cette zone est disponible à la vente
  seatingType: SeatingType; // Type de placement pour cette zone

  // Pour le placement assis uniquement
  rowCount?: number;      // Nombre de rangées
  seatsPerRow?: number;   // Nombre de sièges par rangée
}
