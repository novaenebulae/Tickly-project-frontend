/**
 * Catégories possibles pour un événement.
 */
export type EventCategory =
  | 'Music'
  | 'Theater'
  | 'Sport'
  | 'Conference'
  | 'Exhibition'
  | 'Festival'
  | 'Other';

/**
 * Configuration d'un emplacement spécifique pour un événement.
 * Contient les détails des billets et l'activation pour cet événement à cet emplacement.
 */
export interface EventLocationConfig {
  locationId: number; // ID de l'entité Location référencée
  name: string;       // Nom de l'emplacement (ex: "Main Hall"), issu de l'entité Location
  maxCapacity: number;// Capacité maximale de l'emplacement, issue de l'entité Location
  ticketCount: number | null; // Nombre de billets pour cet événement à cet emplacement
  ticketPrice: number | null; // Prix du billet pour cet événement à cet emplacement
  active: boolean;    // Indique si cette configuration d'emplacement est active pour l'événement
}

/**
 * Statuts possibles d'un événement.
 */
export type EventStatus =
  | 'draft'             // Brouillon, non publié
  | 'published'         // Publié et visible
  | 'pending_approval'  // En attente d'approbation
  | 'cancelled'         // Annulé
  | 'completed';        // Terminé

/**
 * Interface principale définissant la structure d'un objet Événement.
 */
export interface Event {
  id?: number; // Identifiant unique de l'événement, optionnel pour la création

  name: string; // Nom de l'événement (obligatoire)
  category: EventCategory; // Catégorie de l'événement (obligatoire)

  shortDescription?: string; // Description courte (max 300 caractères)
  genre?: string[]; // Genre(s) associé(s) à l'événement
  tags?: string[]; // Mots-clés ou tags (par exemple, une chaîne séparée par des virgules)

  startDate: Date; // Date et heure de début de l'événement (combinées)
  endDate: Date;   // Date et heure de fin de l'événement (combinées)

  isFreeEvent: boolean; // Indique si l'événement est gratuit

  // Liste des configurations d'emplacements pour cet événement.
  // Doit contenir au moins un emplacement actif si l'événement n'est pas un brouillon.
  locations: EventLocationConfig[];

  displayOnHomepage: boolean; // Indique si l'événement doit être affiché sur la page d'accueil
  isFeaturedEvent: boolean; // Indique si l'événement est mis en avant

  fullDescription: string; // Description complète et détaillée (obligatoire, max 1000 caractères)

  links?: string[]; // Tableau d'URLs externes liées à l'événement (ex: site officiel, billetterie externe)

  mainPhotoUrl?: string; // URL de la photo principale de l'événement
  eventPhotoUrls?: string[]; // Tableau d'URLs de photos supplémentaires pour l'événement (max 10)

  status: EventStatus; // Statut actuel de l'événement (ex: brouillon, publié)

  createdByStructureId?: number; // ID de la structure organisatrice
  createdAt?: Date; // Date de création de l'enregistrement
  updatedAt?: Date; // Date de la dernière modification
}
