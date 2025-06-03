/**
 * @file Service dédié à la gestion des structures favorites des utilisateurs.
 * Fournit une interface simplifiée pour les opérations de favoris.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject, signal, computed, WritableSignal, effect, untracked } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { UserApiService } from '../../api/user/user-api.service';
import { StructureService } from '../structure/structure.service';
import { AuthService } from './auth.service';
import { NotificationService } from '../utilities/notification.service';

import { UserFavoriteStructureModel } from '../../../models/user/user-favorite-structure.model';
import { StructureModel } from '../../../models/structure/structure.model';

export interface FavoriteStructureWithDetails extends UserFavoriteStructureModel {
  structure: StructureModel;
}

@Injectable({
  providedIn: 'root'
})
export class UserFavoritesService {
  private userApi = inject(UserApiService);
  private structureService = inject(StructureService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  // Signal pour les favoris de l'utilisateur
  private favoritesSig: WritableSignal<UserFavoriteStructureModel[]> = signal([]);
  public readonly favorites = computed(() => this.favoritesSig());

  // Signal pour les favoris avec les détails des structures
  private favoritesWithDetailsSig: WritableSignal<FavoriteStructureWithDetails[]> = signal([]);
  public readonly favoritesWithDetails = computed(() => this.favoritesWithDetailsSig());

  // Signal pour l'état de chargement
  private isLoadingSig: WritableSignal<boolean> = signal(false);
  public readonly isLoading = computed(() => this.isLoadingSig());

  // Set des IDs des structures favorites pour les vérifications rapides
  public readonly favoriteStructureIds = computed(() =>
    new Set(this.favoritesSig().map(fav => fav.structureId))
  );

  constructor() {
    // Effect pour charger les favoris quand l'utilisateur se connecte
    effect(() => {
      const authUser = this.authService.currentUser();

      if (authUser && authUser.userId) {
        // Charger les favoris lors de la connexion
        untracked(() => {
          this.loadFavorites().subscribe();
        });
      } else {
        // Nettoyer les favoris lors de la déconnexion
        untracked(() => {
          this.favoritesSig.set([]);
          this.favoritesWithDetailsSig.set([]);
        });
      }
    });
  }

  /**
   * Charge les favoris de l'utilisateur connecté.
   * @param forceRefresh - Force le rechargement depuis l'API.
   * @returns Observable des favoris chargés.
   */
  loadFavorites(forceRefresh = false): Observable<UserFavoriteStructureModel[]> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.notification.displayNotification("Vous devez être connecté pour accéder aux favoris.", 'warning');
      return of([]);
    }

    if (!forceRefresh && this.favoritesSig().length > 0) {
      return of(this.favoritesSig());
    }

    this.isLoadingSig.set(true);

    return this.userApi.getUserFavoriteStructures().pipe(
      tap(favorites => {
        this.favoritesSig.set(favorites || []);
        this.loadFavoritesWithDetails(favorites || []);
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors du chargement des favoris.",
          'error'
        );
        return of([]);
      }),
      tap(() => this.isLoadingSig.set(false))
    );
  }

  /**
   * Charge les détails des structures pour les favoris.
   * @param favorites - Liste des favoris.
   */
  private loadFavoritesWithDetails(favorites: UserFavoriteStructureModel[]): void {
    if (favorites.length === 0) {
      this.favoritesWithDetailsSig.set([]);
      return;
    }

    const structureObservables = favorites.map(favorite =>
      this.structureService.getStructureById(favorite.structureId).pipe(
        map(structure => structure ? { ...favorite, structure } : null),
        catchError(() => of(null))
      )
    );

    combineLatest(structureObservables).pipe(
      map(results => results.filter(result => result !== null) as FavoriteStructureWithDetails[])
    ).subscribe(favoritesWithDetails => {
      this.favoritesWithDetailsSig.set(favoritesWithDetails);
    });
  }

  /**
   * Ajoute une structure aux favoris.
   * @param structureId - ID de la structure à ajouter.
   * @returns Observable du favori créé.
   */
  addToFavorites(structureId: number): Observable<UserFavoriteStructureModel | undefined> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.notification.displayNotification("Vous devez être connecté pour ajouter aux favoris.", 'warning');
      return of(undefined);
    }

    // Vérifier si déjà en favoris
    if (this.isFavorite(structureId)) {
      this.notification.displayNotification("Cette structure est déjà dans vos favoris.", 'info');
      return of(undefined);
    }

    return this.userApi.addStructureToFavorites(structureId).pipe(
      tap(newFavorite => {
        if (newFavorite) {
          // Mettre à jour les signaux
          const currentFavorites = this.favoritesSig();
          this.favoritesSig.set([...currentFavorites, newFavorite]);

          // Charger les détails de la nouvelle structure favorite
          this.structureService.getStructureById(structureId).subscribe(structure => {
            if (structure) {
              const currentWithDetails = this.favoritesWithDetailsSig();
              this.favoritesWithDetailsSig.set([
                ...currentWithDetails,
                { ...newFavorite, structure }
              ]);
            }
          });

          this.notification.displayNotification("Structure ajoutée aux favoris avec succès.", 'valid');
        }
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de l'ajout aux favoris.",
          'error'
        );
        return of(undefined);
      })
    );
  }

  /**
   * Retire une structure des favoris.
   * @param structureId - ID de la structure à retirer.
   * @returns Observable de la suppression.
   */
  removeFromFavorites(structureId: number): Observable<void | undefined> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.notification.displayNotification("Vous devez être connecté pour modifier les favoris.", 'warning');
      return of(undefined);
    }

    if (!this.isFavorite(structureId)) {
      this.notification.displayNotification("Cette structure n'est pas dans vos favoris.", 'info');
      return of(undefined);
    }

    return this.userApi.removeStructureFromFavorites(structureId).pipe(
      tap(() => {
        // Mettre à jour les signaux
        const currentFavorites = this.favoritesSig();
        const updatedFavorites = currentFavorites.filter(fav => fav.structureId !== structureId);
        this.favoritesSig.set(updatedFavorites);

        const currentWithDetails = this.favoritesWithDetailsSig();
        const updatedWithDetails = currentWithDetails.filter(fav => fav.structureId !== structureId);
        this.favoritesWithDetailsSig.set(updatedWithDetails);

        this.notification.displayNotification("Structure retirée des favoris.", 'valid');
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de la suppression des favoris.",
          'error'
        );
        return of(undefined);
      })
    );
  }

  /**
   * Bascule le statut favori d'une structure.
   * @param structureId - ID de la structure.
   * @returns Observable du nouveau statut.
   */
  toggleFavorite(structureId: number): Observable<boolean> {
    if (this.isFavorite(structureId)) {
      return this.removeFromFavorites(structureId).pipe(
        map(() => false),
        catchError(() => of(true))
      );
    } else {
      return this.addToFavorites(structureId).pipe(
        map(result => result !== undefined),
        catchError(() => of(false))
      );
    }
  }

  /**
   * Vérifie si une structure est dans les favoris.
   * @param structureId - ID de la structure.
   * @returns True si la structure est favorite.
   */
  isFavorite(structureId: number): boolean {
    return this.favoriteStructureIds().has(structureId);
  }

  /**
   * Retourne le nombre de favoris.
   * @returns Nombre de structures favorites.
   */
  getFavoritesCount(): number {
    return this.favoritesSig().length;
  }

  /**
   * Obtient les IDs des structures favorites sous forme de tableau.
   * @returns Tableau des IDs des structures favorites.
   */
  getFavoriteStructureIds(): number[] {
    return this.favoritesSig().map(fav => fav.structureId);
  }

  /**
   * Vérifie si une structure est favorite via l'API (pour confirmation).
   * @param structureId - ID de la structure.
   * @returns Observable du statut favori.
   */
  checkIsFavoriteViaApi(structureId: number): Observable<boolean> {
    return this.userApi.isStructureFavorite(structureId).pipe(
      catchError(() => of(false))
    );
  }

  /**
   * Rafraîchit les favoris depuis l'API.
   * @returns Observable des favoris rafraîchis.
   */
  refreshFavorites(): Observable<UserFavoriteStructureModel[]> {
    return this.loadFavorites(true);
  }

  /**
   * Nettoie le cache des favoris (utile lors de la déconnexion).
   */
  clearFavorites(): void {
    this.favoritesSig.set([]);
    this.favoritesWithDetailsSig.set([]);
  }
}
