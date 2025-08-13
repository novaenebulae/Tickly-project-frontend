/**
 * @file Domain service for user-related operations.
 * Manages user profiles, updates, and provides utility functions.
 * Composes UserApiService for data fetching and AuthService for user context.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {computed, effect, inject, Injectable, signal, untracked, WritableSignal} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';

import {UserApiService} from '../../api/user/user-api.service';
import {AuthService} from './auth.service';
import {NotificationService} from '../utilities/notification.service';

import {UserModel} from '../../../models/user/user.model';
import {UserProfileUpdateDto} from '../../../models/user/user-profile-update.dto';
import {UserFavoriteStructureModel} from '../../../models/user/user-favorite-structure.model';
import {APP_CONFIG} from '../../../config/app-config';

// ChangePasswordDto is removed as this logic will be in AuthService

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApi = inject(UserApiService); // Using the separated UserApiService
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  // Cache for user profiles (key: userId, value: UserModel)
  // BehaviorSubject allows components to subscribe and get updates when the cache changes.
  private userProfilesCache = new BehaviorSubject<Map<number, UserModel>>(new Map());

  // Signal for the currently viewed/active user profile (e.g., on a profile page or for admin view)
  // undefined: not yet loaded/no specific profile active, null: profile fetch failed or not found
  private activeUserProfileSig: WritableSignal<UserModel | null | undefined> = signal(undefined);

  // Signal for the current authenticated user's own profile data.
  // This will be populated when the user logs in or when their profile is explicitly loaded.
  private currentUserProfileDataSig: WritableSignal<UserModel | null> = signal(null);
  public readonly currentUserProfileData = computed(() => this.currentUserProfileDataSig());

  // Signal for user's favorite structures
  private userFavoritesSig: WritableSignal<UserFavoriteStructureModel[]> = signal([]);

  constructor() {
    // Use effect to react to changes in the authenticated user state from AuthService
    effect(() => {
      const authUser = this.authService.currentUser();

      if (authUser && authUser.userId) {
        // Utiliser untracked pour lire currentUserProfileDataSig sans déclencher l'effect
        const currentProfileData = untracked(() => this.currentUserProfileDataSig());

        if (!currentProfileData || currentProfileData.id !== authUser.userId) {
          this.getCurrentUserProfile(true)
            .subscribe(profile => {
            if (profile) {
              this.currentUserProfileDataSig.set(profile);
            } else {
              this.currentUserProfileDataSig.set(null);
            }
          });

        }

      } else {
        // User logged out
        untracked(() => {
          console.log('UserService flushed');
          this.currentUserProfileDataSig.set(null);
          this.activeUserProfileSig.set(undefined);
          this.userProfilesCache.next(new Map());
          this.userFavoritesSig.set([]); // Clear favorites
        });
      }
    });
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   * This method primarily relies on the `currentUserProfileDataSig` which is populated on login.
   * It can also force a refresh from the API.
   * @param forceRefresh - If true, fetches the profile from the API, bypassing the signal's current value.
   * @returns An Observable of the current user's `UserModel` or `undefined`.
   */
  getCurrentUserProfile(forceRefresh = false): Observable<UserModel | undefined> {
    const currentAuthUser = this.authService.currentUser(); // Get basic auth info (ID, role)

    if (!currentAuthUser || !currentAuthUser.userId) {
      this.notification.displayNotification("Aucun utilisateur n'est actuellement connecté.", 'warning');
      return of(undefined);
    }

    if (!forceRefresh && this.currentUserProfileDataSig()) {
      return of(this.currentUserProfileDataSig()!); // Return cached profile if available and no refresh needed
    }

    // Fetch from API (or reload into signal)
    return this.userApi.getCurrentUserProfile().pipe( // UserApiService handles the 'users/me' endpoint
      tap(profile => {
        if (profile) {
          this.currentUserProfileDataSig.set(profile);
          // Update general cache as well
          const currentCache = this.userProfilesCache.value;
          currentCache.set(profile.id!, profile);
          this.userProfilesCache.next(new Map(currentCache));
        } else {
          this.currentUserProfileDataSig.set(null); // Profile not found via API
        }
      }),
      catchError(error => {
        this.currentUserProfileDataSig.set(null);
        this.notification.displayNotification(
          error.message || "Impossible de récupérer votre profil.", // French message
          'error'
        );
        return of(undefined);
      })
    );
  }

  /**
   * Updates the profile of the currently authenticated user.
   * @param profileUpdateDto - The DTO containing the fields to update.
   * @returns An Observable of the updated `UserModel` or `undefined` if an error occurs.
   */
  updateCurrentUserProfile(profileUpdateDto: UserProfileUpdateDto): Observable<UserModel | undefined> {
    const currentAuthUser = this.authService.currentUser();
    if (!currentAuthUser || !currentAuthUser.userId) {
      this.notification.displayNotification("Action non autorisée : aucun utilisateur connecté pour la mise à jour.", 'error');
      return of(undefined);
    }

    return this.userApi.updateCurrentUserProfile(profileUpdateDto).pipe(
      tap(updatedProfile => {
        if (updatedProfile) {
          // Update general cache
          const currentCache = this.userProfilesCache.value;
          currentCache.set(updatedProfile.id!, updatedProfile);
          this.userProfilesCache.next(new Map(currentCache));

          // Update the currentUserProfileDataSig
          this.currentUserProfileDataSig.set(updatedProfile);

          // If the updated profile is also the one being actively viewed, update that signal too
          if (this.activeUserProfileSig()?.id === updatedProfile.id) {
            this.activeUserProfileSig.set(updatedProfile);
          }

          this.notification.displayNotification("Votre profil a été mis à jour avec succès.", 'valid');
        }
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de la mise à jour de votre profil.", // French message
          'error'
        );
        return of(undefined);
      })
    );
  }


  /**
   * Uploade un avatar pour l'utilisateur courant.
   * En cas de succès, récupère le profil utilisateur mis à jour et met à jour les signaux.
   * @param file Le fichier d'avatar à uploader.
   * @returns Un Observable du `UserModel` mis à jour, ou undefined en cas d'erreur.
   */
  uploadUserAvatar(file: File): Observable<UserModel | undefined> {
    return this.userApi.uploadAvatar(file).pipe(
      // Après l'upload réussi, récupérer le profil utilisateur mis à jour
      switchMap(uploadResponse => {
        this.notification.displayNotification(uploadResponse.message || 'Avatar mis à jour avec succès.', 'valid');

        // Récupérer le profil utilisateur mis à jour qui contiendra la nouvelle avatarUrl
        return this.userApi.getCurrentUserProfile().pipe(
          tap(updatedUser => {
            // Mettre à jour le signal du profil de l'utilisateur courant
            this.currentUserProfileDataSig.set(updatedUser);

            // Mettre à jour le profil dans le cache
            const currentCache = this.userProfilesCache.value;
            currentCache.set(updatedUser.id, updatedUser);
            this.userProfilesCache.next(new Map(currentCache));
          }),
          catchError(profileError => {
            console.error('Erreur lors de la récupération du profil mis à jour:', profileError);
            // Même si on ne peut pas récupérer le profil, l'upload a réussi
            // On peut créer un UserModel temporaire avec l'URL de l'avatar
            const currentUser = this.currentUserProfileDataSig();
            if (currentUser) {
              const updatedUser = { ...currentUser, avatarUrl: uploadResponse.fileUrl };
              this.currentUserProfileDataSig.set(updatedUser);
              return of(updatedUser);
            }
            return of(undefined);
          })
        );
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de la mise à jour de l'avatar.",
          'error'
        );
        return of(undefined);
      })
    );
  }

  /**
   * Demande la suppression du compte utilisateur courant.
   * Déclenche l'envoi d'un email avec un lien de confirmation.
   * @returns Un Observable avec true si succès, false sinon.
   */
  requestAccountDeletion(): Observable<boolean> {
    const currentAuthUser = this.authService.currentUser();
    if (!currentAuthUser || !currentAuthUser.userId) {
      this.notification.displayNotification("Action non autorisée : aucun utilisateur connecté.", 'error');
      return of(false);
    }

    return this.userApi.requestAccountDeletion().pipe(
      map(() => {
        this.notification.displayNotification(
          "Un email de confirmation de suppression a été envoyé à votre adresse.",
          'valid'
        );
        return true;
      }),
      catchError(error => {
        console.log('Error object in UserService:', error);
        console.log('error.message:', error.message);
        console.log('error.error?.message:', error.error?.message);

        this.notification.displayNotification(
          error.userMessage || "Erreur lors de la demande de suppression du compte.",
          'error'
        );
        return of(false);
      })
    );
  }

  /**
   * Confirme la suppression du compte utilisateur avec le token.
   * @param token - Token de confirmation reçu par email
   * @returns Un Observable avec true si succès, false sinon.
   */
  confirmAccountDeletion(token: string): Observable<boolean> {
    if (!token || token.trim().length === 0) {
      this.notification.displayNotification("Token de confirmation manquant.", 'error');
      return of(false);
    }

    return this.userApi.confirmAccountDeletion(token).pipe(
      map(() => {
        this.notification.displayNotification(
          "Votre compte a été supprimé avec succès.",
          'valid'
        );
        return true;
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de la confirmation de suppression du compte.",
          'error'
        );
        return of(false);
      })
    );
  }

}
