import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {StructureSummaryModel} from '../../../../core/models/structure/structure-summary.model';

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
  @Input() structure!: StructureSummaryModel;
  @Input() showActions = true;
  @Input() eventCount?: number;
  @Input() highlightNewStructure = false;
  @Input() showFavoriteButton = false;
  @Input() isFavorite = false;

  @Output() viewDetails = new EventEmitter<StructureSummaryModel>();
  @Output() bookEvent = new EventEmitter<StructureSummaryModel>();
  @Output() favorite = new EventEmitter<StructureSummaryModel>();


  constructor() {}

  onViewDetails(): void {
    this.viewDetails.emit(this.structure);
  }

  onFavorite(): void {
    // L'état 'isFavorite' est géré par le parent pour une source de vérité unique.
    // Le composant émet simplement l'événement.
    this.favorite.emit(this.structure);
  }

}
