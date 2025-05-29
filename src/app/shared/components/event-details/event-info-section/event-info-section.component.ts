// src/app/shared/components/event-details/event-info-section/event-info-section.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

import { EventModel } from '../../../../core/models/event/event.model';
import { StructureModel } from '../../../../core/models/structure/structure.model';
import { SeatingType } from '../../../../core/models/event/event-audience-zone.model';
import {mockAreas} from '../../../../core/mocks/structures/areas.mock';

@Component({
  selector: 'app-event-info-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './event-info-section.component.html',
  styleUrls: ['./event-info-section.component.scss']
})
export class EventInfoSectionComponent {
  @Input() event!: EventModel;
  @Input() structure: StructureModel | null = null;
  @Input() isUserLoggedIn = false;

  @Output() addToCalendar = new EventEmitter<void>();
  @Output() addToFavorites = new EventEmitter<void>();

  protected formattedAddress: string = '';

  /**
   * Retourne l'URL du logo de la structure ou une image par défaut
   */
  getStructureLogoUrl(): string {
    return this.structure?.logoUrl || 'assets/images/structure-placeholder.jpg';
  }

  /**
   * Obtient le prix minimal à partir des zones de places
   */
  getMinPrice(): number | null {
    if (!this.event.seatingZones || this.event.seatingZones.length === 0) {
      return null;
    }

    // Filtrer les zones ayant un prix et trouver le prix minimum
    const prices = this.event.seatingZones
      .filter(zone => zone.ticketPrice !== null && zone.ticketPrice > 0)
      .map(zone => zone.ticketPrice as number);

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  /**
   * Obtient le prix maximal à partir des zones de places
   */
  getMaxPrice(): number | null {
    if (!this.event.seatingZones || this.event.seatingZones.length === 0) {
      return null;
    }

    // Filtrer les zones ayant un prix et trouver le prix maximum
    const prices = this.event.seatingZones
      .filter(zone => zone.ticketPrice !== null && zone.ticketPrice > 0)
      .map(zone => zone.ticketPrice as number);

    return prices.length > 0 ? Math.max(...prices) : null;
  }

  /**
   * Retourne une description du type de placement
   */
  getSeatingTypeDescription(): string {
    switch (this.event.defaultSeatingType) {
      case SeatingType.SEATED:
        return 'Places numérotées';
      case SeatingType.STANDING:
        return 'Placement libre';
      case SeatingType.MIXED:
        return 'Placement mixte';
      default:
        return 'Placement non spécifié';
    }
  }

  /**
   * Obtient l'adresse complète formatée
   */
  getFormattedAddress(): string {
    const address = this.event.address;
    if (!address) {
      return 'Adresse non spécifiée';
    }
    this.formattedAddress = `${address.street}${address.number ? ' ' + address.number : ''}, ${address.zipCode} ${address.city}, ${address.country || 'France'}`;
    return this.formattedAddress;
  }

  /**
   * Émet l'événement pour ajouter au calendrier
   */
  onAddToCalendar(): void {
    this.addToCalendar.emit();
  }

  /**
   * Émet l'événement pour ajouter aux favoris
   */
  onAddToFavorites(): void {
    this.addToFavorites.emit();
  }

  /**
   * Génère l'URL Google Maps pour l'adresse
   */
  getGoogleMapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${this.formattedAddress}`;
  }

  /**
   * Affiche les types de structure formatés
   */
  getStructureTypes(): string[] {
    if (!this.structure || !this.structure.types || this.structure.types.length === 0) {
      return [];
    }

    return this.structure.types.map(type => type.type);
  }

}
