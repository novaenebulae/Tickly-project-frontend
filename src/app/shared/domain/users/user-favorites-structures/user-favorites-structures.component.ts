/**
 * @file Composant d'affichage et de gestion des structures favorites de l'utilisateur.
 * Utilise les cards structures réutilisables avec gestion des favoris par le cœur.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Component, inject, OnInit, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import {StructureCardComponent} from '../../structures/structure-card/structure-card.component';
import { UserFavoritesService } from '../../../../core/services/domain/user/user-favorites.service';
import { AuthService } from '../../../../core/services/domain/user/auth.service';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';
import { StructureModel } from '../../../../core/models/structure/structure.model';

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
export class UserFavoritesStructuresComponent implements OnInit {
  private favoritesService = inject(UserFavoritesService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // Signaux pour la gestion des états
  public readonly favoritesWithDetails = this.favoritesService.favoritesWithDetails;
  public readonly isLoading = this.favoritesService.isLoading;
  public readonly favoritesCount = computed(() => this.favoritesService.getFavoritesCount());
  public readonly currentUser = this.authService.currentUser;

  // Signal local pour les filtres d'affichage
  private viewModeSig: WritableSignal<'grid' | 'list'> = signal('grid');
  public readonly viewMode = computed(() => this.viewModeSig());

  ngOnInit(): void {
    this.loadFavorites();
  }

  /**
   * Charge les favoris de l'utilisateur.
   * @param forceRefresh - Force le rechargement depuis l'API.
   */
  loadFavorites(forceRefresh = false): void {
    if (!this.currentUser()) {
      this.notification.displayNotification(
        "Vous devez être connecté pour voir vos favoris.",
        'warning'
      );
      return;
    }

    this.favoritesService.loadFavorites(forceRefresh).subscribe({
      next: (favorites) => {
        console.log(`📋 Favoris chargés: ${favorites.length} structures`);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des favoris:', error);
        this.notification.displayNotification(
          "Erreur lors du chargement de vos favoris.",
          'error'
        );
      }
    });
  }

  /**
   * Rafraîchit la liste des favoris.
   */
  refreshFavorites(): void {
    this.loadFavorites(true);
  }

  /**
   * Gère l'affichage des détails d'une structure depuis la card.
   * @param structure - La structure sélectionnée.
   */
  onViewStructureDetails(structure: StructureModel): void {
    this.router.navigate(['/structures', structure.id]);
  }

  /**
   * Gère la navigation vers les événements d'une structure depuis la card.
   * @param structure - La structure sélectionnée.
   */
  onBookStructureEvents(structure: StructureModel): void {
    this.router.navigate(['/events'], {
      queryParams: { structureId: structure.id }
    });
  }

  /**
   * Gère le toggle des favoris depuis la card (ajout/suppression).
   * @param structure - La structure à ajouter/supprimer des favoris.
   */
  onToggleFavorite(structure: StructureModel): void {
    if (!structure.id) {
      this.notification.displayNotification(
        "Erreur: ID de structure manquant.",
        'error'
      );
      return;
    }

    // Utiliser le service de favoris pour basculer
    this.favoritesService.toggleFavorite(structure.id).subscribe({
      next: (isNowFavorite) => {
        const message = isNowFavorite
          ? `${structure.name} ajoutée aux favoris`
          : `${structure.name} retirée des favoris`;

        this.notification.displayNotification(message, 'valid');
      },
      error: (error) => {
        console.error('Erreur lors du toggle favori:', error);
        this.notification.displayNotification(
          "Erreur lors de la modification des favoris.",
          'error'
        );
      }
    });
  }

  /**
   * Vérifie si une structure a été ajoutée récemment (dernières 24h).
   * @param addedDate - Date d'ajout aux favoris.
   * @returns True si ajoutée récemment.
   */
  isRecentlyAdded(addedDate: Date): boolean {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    return new Date(addedDate) > twentyFourHoursAgo;
  }

  /**
   * Formate la date d'ajout en favoris.
   * @param date - Date d'ajout.
   * @returns Date formatée.
   */
  formatAddedDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }

  /**
   * Génère les paramètres de requête pour filtrer les événements par structures favorites.
   * @returns Paramètres de requête pour la page événements.
   */
  getEventsQueryParams(): { [key: string]: string } {
    const structureIds = this.favoritesWithDetails()
      .map(fav => fav.structure.id)
      .filter(id => id !== undefined)
      .join(',');

    return {
      structureIds: structureIds,
      favoriteStructures: 'true'
    };
  }
}
