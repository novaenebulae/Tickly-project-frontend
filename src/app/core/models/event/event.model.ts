
// src/app/core/models/event/event.model.ts
import { EventCategoryModel } from './event-category.model';
import { EventSeatingZone, SeatingType } from './seating.model';
import { AddressModel } from '../structure/address.model';
import { AreaModel } from '../structure/area.model';

// Statuts possibles d'un événement
export type EventStatus =
  | 'draft'             // Brouillon, non publié
  | 'published'         // Publié et visible
  | 'pending_approval'  // En attente d'approbation
  | 'cancelled'         // Annulé
  | 'completed';        // Terminé

// Interface principale pour un événement
export interface EventModel {
  id?: number;
  name: string;                       // Nom de l'événement
  category: EventCategoryModel;       // Catégorie de l'événement

  shortDescription?: string;          // Description courte
  fullDescription: string;            // Description complète
  genre?: string[];                   // Genre(s) associé(s)
  tags?: string[];                    // Mots-clés

  startDate: Date;                    // Date et heure de début
  endDate: Date;                      // Date et heure de fin

  // Adresse de l'événement
  address: AddressModel;              // Adresse de l'événement

  // Référence à la structure
  structureId: number;                // Structure organisatrice
  areas?: AreaModel[];                // Zones de la structure où se déroule l'événement

  // Gestion des places et prix
  isFreeEvent: boolean;               // Si l'événement est gratuit
  defaultSeatingType: SeatingType;    // Type de placement par défaut
  seatingZones: EventSeatingZone[];   // Zones de placement configurées pour cet événement

  // Visibilité et promotion
  displayOnHomepage: boolean;         // À afficher sur la page d'accueil
  isFeaturedEvent: boolean;           // Mise en avant

  // Liens et médias
  links?: string[];                   // Liens externes
  mainPhotoUrl?: string;              // Photo principale
  eventPhotoUrls?: string[];          // Photos supplémentaires

  // Métadonnées
  status: EventStatus;                // Statut actuel
  createdAt?: Date;
  updatedAt?: Date;
}

// DTO pour la création d'événement
export interface EventCreationDto {
  name: string;
  categoryId: number;
  shortDescription?: string;
  fullDescription: string;
  genre?: string[];
  tags?: string[];
  startDate: Date;
  endDate: Date;
  address: AddressModel;
  structureId: number;
  areaIds?: number[];                 // IDs des zones où se déroule l'événement
  isFreeEvent: boolean;
  defaultSeatingType: SeatingType;
  seatingZones: Omit<EventSeatingZone, 'id'>[];
  displayOnHomepage?: boolean;
  isFeaturedEvent?: boolean;
  links?: string[];
  mainPhotoUrl?: string;
  eventPhotoUrls?: string[];
}


