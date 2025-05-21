import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StructureModel } from '../../../../core/models/structure/structure.model';

@Component({
  selector: 'app-structure-card',
  templateUrl: './structure-card.component.html',
  styleUrls: ['./structure-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class StructureCardComponent {
  @Input() structure!: StructureModel;
  @Input() showActions = true;
  @Input() eventCount?: number;
  @Input() highlightNewStructure = false;
  @Input() showFavoriteButton = false;

  @Output() viewDetails = new EventEmitter<StructureModel>();
  @Output() bookEvent = new EventEmitter<StructureModel>();
  @Output() favorite = new EventEmitter<StructureModel>();

  constructor() {}

  getStructureType(): string {
    return this.structure.types && this.structure.types.length > 0
      ? this.structure.types[0].type
      : 'Non catégorisé';
  }

  getAddress(): string {
    const address = this.structure.address;
    if (!address) return 'Adresse non disponible';

    const parts = [];
    if (address.number) parts.push(address.number);
    if (address.street) parts.push(address.street);
    if (address.zipCode || address.city) {
      const cityPart = [address.zipCode, address.city].filter(Boolean).join(' ');
      if (cityPart) parts.push(cityPart);
    }

    return parts.join(', ') || 'Adresse non disponible';
  }

  getCityName(): string {
    return this.structure.address?.city || 'Ville non spécifiée';
  }

  getFormattedDate(date?: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getImportanceClass(): string {
    if (this.structure.importance === undefined) return '';

    if (this.structure.importance >= 70) return 'importance-high';
    if (this.structure.importance >= 40) return 'importance-medium';
    return 'importance-low';
  }

  getImportanceLabel(): string {
    if (this.structure.importance === undefined) return '';

    if (this.structure.importance >= 70) return 'Très populaire';
    if (this.structure.importance >= 40) return 'Populaire';
    return 'Lieu émergent';
  }

  getFacebookUrl(): string | null {
    if (!this.structure.socialsUrl || this.structure.socialsUrl.length === 0) return null;
    return this.structure.socialsUrl.find(url => url.includes('facebook.com')) || null;
  }

  getInstagramUrl(): string | null {
    if (!this.structure.socialsUrl || this.structure.socialsUrl.length === 0) return null;
    return this.structure.socialsUrl.find(url => url.includes('instagram.com')) || null;
  }

  getTwitterUrl(): string | null {
    if (!this.structure.socialsUrl || this.structure.socialsUrl.length === 0) return null;
    return this.structure.socialsUrl.find(url =>
      url.includes('twitter.com') || url.includes('x.com')
    ) || null;
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.structure);
  }

  onBookEvent(): void {
    this.bookEvent.emit(this.structure);
  }

  onFavorite(): void {
    this.favorite.emit(this.structure);
  }
}
