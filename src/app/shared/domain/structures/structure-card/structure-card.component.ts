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
