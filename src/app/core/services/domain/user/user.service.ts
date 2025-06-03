/**
 * @file Domain service for user-related operations.
 * Manages user profiles, updates, and provides utility functions.
 * Composes UserApiService for data fetching and AuthService for user context.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {Injectable, inject, signal, computed, WritableSignal, effect, untracked} from '@angular/core';
import {Observable, of, BehaviorSubject, map} from 'rxjs';
import {catchError, tap, switchMap} from 'rxjs/operators';

import {UserApiService} from '../../api/user/user-api.service';
import {AuthService} from './auth.service';
import {NotificationService} from '../utilities/notification.service';

import {UserModel} from '../../../models/user/user.model';
import {UserProfileUpdateDto} from '../../../models/user/user-profile-update.dto';
import {UserFavoriteStructureModel} from '../../../models/user/user-favorite-structure.model';

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
  private avatarUrlCache = new Map<string, string>();


  // Signal for the currently viewed/active user profile (e.g., on a profile page or for admin view)
  // undefined: not yet loaded/no specific profile active, null: profile fetch failed or not found
  private activeUserProfileSig: WritableSignal<UserModel | null | undefined> = signal(undefined);
  public readonly activeUserProfile = computed(() => this.activeUserProfileSig());

  // Signal for the current authenticated user's own profile data.
  // This will be populated when the user logs in or when their profile is explicitly loaded.
  private currentUserProfileDataSig: WritableSignal<UserModel | null> = signal(null);
  public readonly currentUserProfileData = computed(() => this.currentUserProfileDataSig());

  // Signal for user's favorite structures
  private userFavoritesSig: WritableSignal<UserFavoriteStructureModel[]> = signal([]);
  public readonly userFavorites = computed(() => this.userFavoritesSig());


  constructor() {
    // Use effect to react to changes in the authenticated user state from AuthService
    effect(() => {
      const authUser = this.authService.currentUser();

      if (authUser && authUser.userId) {
        // Utiliser untracked pour lire currentUserProfileDataSig sans déclencher l'effect
        const currentProfileData = untracked(() => this.currentUserProfileDataSig());

        if (!currentProfileData || currentProfileData.id !== authUser.userId) {
          this.loadUserProfile(authUser.userId, true).subscribe(profile => {
            if (profile) {
              this.currentUserProfileDataSig.set(profile);
            } else {
              this.currentUserProfileDataSig.set(null);
            }
          });
        }

        // Load user favorites when user logs in
        this.loadUserFavorites().subscribe();
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
   * Loads a specific user's profile by their ID.
   * Fetches from the API if not in cache or if `forceRefresh` is true.
   * Updates the `activeUserProfileSig` with the fetched profile.
   * @param userId - The ID of the user whose profile is to be loaded.
   * @param forceRefresh - If true, the profile will be fetched from the API even if present in the cache.
   * @returns An Observable of the `UserModel` or `undefined` if not found or an error occurs.
   */
  loadUserProfile(userId: number, forceRefresh = false): Observable<UserModel | undefined> {
    // Indicate loading state for the active profile if this ID is being targeted
    if (this.activeUserProfileSig() === undefined || this.activeUserProfileSig()?.id !== userId || forceRefresh) {
      this.activeUserProfileSig.set(undefined); // Set to loading/undefined if changing target or forcing
    }

    const cachedProfile = this.userProfilesCache.value.get(userId);
    if (!forceRefresh && cachedProfile) {
      this.activeUserProfileSig.set(cachedProfile);
      return of(cachedProfile);
    }

    return this.userApi.getUserProfileById(userId).pipe(
      tap(profile => {
        if (profile) {
          const currentCache = this.userProfilesCache.value;
          currentCache.set(userId, profile);
          this.userProfilesCache.next(new Map(currentCache)); // Emit new Map instance for change detection
          this.activeUserProfileSig.set(profile);
        } else {
          this.activeUserProfileSig.set(null); // Profile not found
        }
      }),
      catchError(error => {
        this.activeUserProfileSig.set(null); // Error state for active profile
        this.notification.displayNotification(
          error.message || "Impossible de charger le profil utilisateur demandé.", // French message
          'error'
        );
        return of(undefined); // Return undefined on error
      })
    );
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

          // Notify AuthService to potentially update its internal representation if needed
          // (e.g., if name/avatar stored in JWT payload's mirror needs refresh display-wise)
          this.authService.refreshCurrentUserDataFromUpdatedProfile(updatedProfile);

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
   * Loads the current user's favorite structures.
   * @param forceRefresh - If true, fetches from API even if already loaded.
   * @returns An Observable of an array of `UserFavoriteStructureModel`.
   */
  loadUserFavorites(forceRefresh = false): Observable<UserFavoriteStructureModel[]> {
    if (!forceRefresh && this.userFavoritesSig().length > 0) {
      return of(this.userFavoritesSig());
    }

    return this.userApi.getUserFavoriteStructures().pipe(
      tap(favorites => {
        this.userFavoritesSig.set(favorites || []);
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors du chargement des favoris.",
          'error'
        );
        return of([]);
      })
    );
  }

  /**
   * Adds a structure to the current user's favorites.
   * @param structureId - The ID of the structure to add.
   * @returns An Observable of the created favorite or undefined if error.
   */
  addToFavorites(structureId: number): Observable<UserFavoriteStructureModel | undefined> {
    return this.userApi.addStructureToFavorites(structureId).pipe(
      tap(newFavorite => {
        if (newFavorite) {
          const currentFavorites = this.userFavoritesSig();
          this.userFavoritesSig.set([...currentFavorites, newFavorite]);
          this.notification.displayNotification("Structure ajoutée aux favoris.", 'valid');
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
   * Removes a structure from the current user's favorites.
   * @param structureId - The ID of the structure to remove.
   * @returns An Observable of void or undefined if error.
   */
  removeFromFavorites(structureId: number): Observable<void | undefined> {
    return this.userApi.removeStructureFromFavorites(structureId).pipe(
      tap(() => {
        const currentFavorites = this.userFavoritesSig();
        const updatedFavorites = currentFavorites.filter(fav => fav.structureId !== structureId);
        this.userFavoritesSig.set(updatedFavorites);
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
   * Checks if a structure is in the current user's favorites.
   * @param structureId - The ID of the structure to check.
   * @returns An Observable of boolean.
   */
  isStructureFavorite(structureId: number): Observable<boolean> {
    return this.userApi.isStructureFavorite(structureId).pipe(
      catchError(() => of(false))
    );
  }

  /**
   * Toggles a structure's favorite status.
   * @param structureId - The ID of the structure to toggle.
   * @returns An Observable with the operation result and new state.
   */
  toggleFavorite(structureId: number): Observable<{success: boolean, isFavorite: boolean, favorite?: UserFavoriteStructureModel}> {
    const currentFavorites = this.userFavoritesSig();
    const isFavorite = currentFavorites.some(fav => fav.structureId === structureId);

    if (isFavorite) {
      return this.removeFromFavorites(structureId).pipe(
        map(() => ({success: true, isFavorite: false})),
        catchError(() => of({success: false, isFavorite: true}))
      );
    } else {
      return this.addToFavorites(structureId).pipe(
        map((favorite) => ({
          success: favorite !== undefined,
          isFavorite: favorite !== undefined,
          favorite
        })),
        catchError(() => of({success: false, isFavorite: false}))
      );
    }
  }

  /**
   * Gets the list of favorite structure IDs for quick checks.
   * @returns An array of structure IDs that are favorites.
   */
  getFavoriteStructureIds(): number[] {
    return this.userFavoritesSig().map(fav => fav.structureId);
  }


  // changePassword method is REMOVED from UserService.
  // It will be handled by AuthService, involving an email flow from the backend.

  /**
   * Searches for users based on a query string (e.g., name or email).
   * @param query - The search term. Must be at least 2 characters long.
   * @returns An Observable of an array of `Partial<UserModel>`.
   *          Returns an empty array if the query is too short or an error occurs.
   */
  searchUsers(query: string): Observable<Partial<UserModel>[]> {
    if (!query || query.trim().length < 2) {
      this.notification.displayNotification("Veuillez entrer au moins 2 caractères pour lancer la recherche.", 'info');
      return of([]);
    }
    return this.userApi.searchUsers(query).pipe(
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de la recherche d'utilisateurs.", // French message
          'error'
        );
        return of([]);
      })
    );
  }

  /**
   * Generates a placeholder avatar URL based on the user's initials with caching.
   * @param firstName - The user's first name.
   * @param lastName - The user's last name.
   * @param size - The desired size of the avatar image in pixels (default: 128).
   * @returns A URL string for the placeholder avatar image.
   */
  generateAvatarUrl(firstName?: string, lastName?: string, size: number = 128): string {
    // ✅ Création d'une clé de cache unique
    const cacheKey = `${firstName || ''}-${lastName || ''}-${size}`;

    // ✅ Vérification du cache
    const cachedUrl = this.avatarUrlCache.get(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }

    const getInitials = (fName?: string, lName?: string): string => {
      const firstInitial = fName ? fName.charAt(0).toUpperCase() : '';
      const lastInitial = lName ? lName.charAt(0).toUpperCase() : '';
      if (firstInitial && lastInitial) return firstInitial + lastInitial;
      if (firstInitial) return firstInitial;
      if (lastInitial) return lastInitial;
      return '??';
    };

    const initials = getInitials(firstName, lastName);

    // Simple color generation based on initials for consistency
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    const s = 70;
    const l = 50;

    let avatarUrl: string;

    // Fallback if no initials
    if (initials === '??') {
      avatarUrl = `https://avatar.iran.liara.run/public`;
    } else {
      const bgColorHex = this.hslToHex(h, s, l);
      const textColorHex = this.hslToHex(h, s, (l < 50 ? l + 40 : l - 20));
      avatarUrl = `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}&color=${textColorHex}&background=${bgColorHex}&size=${size}`;
    }

    // ✅ Mise en cache du résultat
    this.avatarUrlCache.set(cacheKey, avatarUrl);
    return avatarUrl;
  }


  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }


  /**
   * Clears the currently active user profile from the service's state.
   * This might be called when a user navigates away from a specific profile page.
   */
  clearActiveUserProfile(): void {
    this.activeUserProfileSig.set(undefined);
  }

  /**
   * Retrieves a user profile directly from the service's cache if available.
   * @param userId - The ID of the user.
   * @returns The cached `UserModel` or `undefined` if not found in the cache.
   */
  getUserFromCache(userId: number): UserModel | undefined {
    return this.userProfilesCache.value.get(userId);
  }
}
