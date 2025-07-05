/**
 * @file Service dédié à la gestion des structures favorites des utilisateurs.
 * Fournit une interface simplifiée pour les opérations de favoris.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {computed, effect, inject, Injectable, signal, untracked, WritableSignal} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

import {UserApiService} from '../../api/user/user-api.service';
import {AuthService} from './auth.service';
import {NotificationService} from '../utilities/notification.service';

import {FavoriteStructureDto, UserFavoriteStructureModel} from '../../../models/user/user-favorite-structure.model';


@Injectable({
  providedIn: 'root'
})
export class UserFavoritesService {
  private userApi = inject(UserApiService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  // Signal unique pour les favoris, contenant maintenant les détails de la structure
  private favoritesSig: WritableSignal<UserFavoriteStructureModel[]> = signal([]);
  public readonly favorites = computed(() => this.favoritesSig());

  // Signal pour l'état de chargement
  private isLoadingSig: WritableSignal<boolean> = signal(false);
  public readonly isLoading = computed(() => this.isLoadingSig());

  // Set des IDs des structures favorites pour les vérifications rapides et efficaces
  public readonly favoriteStructureIds = computed(() =>
    new Set(this.favoritesSig().map(fav => fav.structure.id))
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
        });
      }
    });
  }

  /**
   * Vérifie si une structure est dans les favoris de l'utilisateur.
   * @param structureId - L'ID de la structure à vérifier.
   * @returns Vrai si la structure est un favori.
   */
  isFavorite(structureId: number): boolean {
    return this.favoriteStructureIds().has(structureId);
  }

  /**
   * Charge les favoris de l'utilisateur connecté depuis l'API.
   * @param forceRefresh - Force le rechargement depuis l'API.
   * @returns Observable des favoris chargés.
   */
  loadFavorites(forceRefresh = false): Observable<UserFavoriteStructureModel[]> {
    if (!this.authService.currentUser()) {
      return of([]);
    }

    if (!forceRefresh && this.favoritesSig().length > 0) {
      return of(this.favoritesSig());
    }

    this.isLoadingSig.set(true);

    return this.userApi.getUserFavoriteStructures().pipe(
      tap(favorites => {
        this.favoritesSig.set(favorites || []);
        this.isLoadingSig.set(false);
      }),
      catchError(error => {
        this.isLoadingSig.set(false);
        this.favoritesSig.set([]);
        this.notification.displayNotification("Impossible de charger les favoris.", 'error');
        console.error("Erreur lors du chargement des favoris:", error);
        return of([]);
      })
    );
  }

  /**
   * Ajoute une structure aux favoris et met à jour l'état local.
   * @param structureId - ID de la structure à ajouter.
   * @returns Observable du favori ajouté.
   */
  private addToFavorites(structureId: number): Observable<UserFavoriteStructureModel | undefined> {
    const dto: FavoriteStructureDto = { structureId };
    return this.userApi.addFavoriteStructure(dto).pipe(
      tap(newFavorite => {
        if (newFavorite) {
          this.favoritesSig.update(currentFavorites => [...currentFavorites, newFavorite]);
          this.notification.displayNotification('Structure ajoutée aux favoris.', 'valid');
        }
      }),
      catchError(error => {
        this.notification.displayNotification("Impossible d'ajouter aux favoris.", 'error');
        return of(undefined);
      })
    );
  }

  /**
   * Retire une structure des favoris et met à jour l'état local.
   * @param structureId - ID de la structure à retirer.
   * @returns Observable<void> pour indiquer la réussite ou l'échec.
   */
  private removeFromFavorites(structureId: number): Observable<void> {
    return this.userApi.removeFavoriteStructure(structureId).pipe(
      tap(() => {
        this.favoritesSig.update(currentFavorites =>
          currentFavorites.filter(fav => fav.structure.id !== structureId)
        );
        this.notification.displayNotification('Structure retirée des favoris.', 'info');
      }),
      catchError(error => {
        this.notification.displayNotification("Impossible de retirer des favoris.", 'error');
        return throwError(() => error); // Propager l'erreur
      })
    );
  }

  /**
   * Bascule le statut favori d'une structure.
   * @param structureId - ID de la structure.
   * @returns Observable du nouveau statut (true si favori, false sinon).
   */
  toggleFavorite(structureId: number): Observable<boolean> {
    if (this.isFavorite(structureId)) {
      return this.removeFromFavorites(structureId).pipe(
        map(() => false), // Si la suppression réussit, le nouveau statut est "non favori"
        catchError(() => of(true)) // Si la suppression échoue, on suppose qu'elle est toujours favorite
      );
    } else {
      return this.addToFavorites(structureId).pipe(
        map(result => !!result), // Si l'ajout réussit (result n'est pas undefined), le nouveau statut est "favori"
        catchError(() => of(false)) // Si l'ajout échoue, elle n'est pas favorite
      );
    }
  }

}
