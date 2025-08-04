// src/app/shared/components/event-details/event-info-section/event-info-section.component.ts

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatChipsModule} from '@angular/material/chips';
import {RouterModule} from '@angular/router';

import {EventModel, EventStatus} from '../../../../core/models/event/event.model';
import {StructureModel} from '../../../../core/models/structure/structure.model';

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
  @Output() bookEvent = new EventEmitter<void>();

  protected formattedAddress: string = '';

  /**
   * Retourne l'URL du logo de la structure ou une image par défaut
   */
  getStructureLogoUrl(): string {
    return this.structure?.logoUrl || 'assets/images/structure-placeholder.jpg';
  }


  /**
   * Obtient l'adresse complète formatée sans le code postal
   */
  getFormattedAddress(): string {
    const address = this.event.address;
    if (!address) {
      return 'Adresse non spécifiée';
    }
    // Hide zipCode as per requirements
    this.formattedAddress = `${address.street}${address.number ? ' ' + address.number : ''}, ${address.city}, ${address.country || 'France'}`;
    return this.formattedAddress;
  }

  /**
   * Calcule la capacité totale des zones d'audience
   */
  getRemainingCapacity(): number {
    if (!this.event.audienceZones || this.event.audienceZones.length === 0) {
      return 0;
    }

    console.log(this.event.audienceZones);

    // Sum up the remaining capacity of all active audience zones
    return this.event.audienceZones
      .filter(zone => zone.isActive)
      .reduce((total, zone) => total + zone.remainingCapacity, 0);
  }

  /**
   * Émet l'événement pour réserver l'événement
   */
  onBookEvent(): void {
    this.bookEvent.emit();
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

    return this.structure.types.map(type => type.name);
  }

  protected readonly EventStatus = EventStatus;
}
