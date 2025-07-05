import {Component, computed, inject, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';

import {StructureCardComponent} from '../../../../shared/domain/structures/structure-card/structure-card.component';
import {UserFavoritesService} from '../../../../core/services/domain/user/user-favorites.service';
import {AuthService} from '../../../../core/services/domain/user/auth.service';
import {StructureSummaryModel} from '../../../../core/models/structure/structure-summary.model';

@Component({
  selector: 'app-user-favorites-structures',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    StructureCardComponent
  ],
  templateUrl: './user-favorites-structures.component.html',
  styleUrls: ['./user-favorites-structures.component.scss']
})
export class UserFavoritesStructuresComponent {
  private favoritesService = inject(UserFavoritesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signaux connectés directement au service
  public readonly favorites = this.favoritesService.favorites;
  public readonly isLoading = this.favoritesService.isLoading;
  public readonly currentUser = this.authService.currentUser;

  // Signaux dérivés et locaux
  public readonly favoritesCount = computed(() => this.favorites().length);
  private viewModeSig: WritableSignal<'grid' | 'list'> = signal('grid');
  public readonly viewMode = computed(() => this.viewModeSig());

  /**
   * Gère l'affichage des détails d'une structure depuis la card.
   * @param structure - La structure sélectionnée.
   */
  onViewStructureDetails(structure: StructureSummaryModel): void {
    this.router.navigate(['/structures', structure.id]);
  }

  /**
   * Gère la navigation vers les événements d'une structure depuis la card.
   * @param structure - La structure sélectionnée.
   */
  onBookStructureEvents(structure: StructureSummaryModel): void {
    this.router.navigate(['/events'], {
      queryParams: { structureId: structure.id }
    });
  }

  /**
   * Gère le toggle des favoris depuis la card (ajout/suppression).
   * @param structure - La structure à ajouter/supprimer des favoris.
   */
  onToggleFavorite(structure: StructureSummaryModel): void {
    this.favoritesService.toggleFavorite(structure.id).subscribe();
  }

  /**
   * Formate la date d'ajout en favoris.
   * @param date - Date d'ajout.
   * @returns Date formatée.
   */
  formatAddedDate(date: Date | string): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }
}
