// src/app/core/services/domain/user.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, catchError, tap, map } from 'rxjs';

// Services
import { NotificationService } from './notification.service';
import { ApiConfigService } from '../api/api-config.service';
import { AuthService } from './auth.service';

// Models
import { UserModel } from '../../models/user/user.model';
import { APP_CONFIG } from '../../config/app-config';

// Mocks
import { mockUsers } from '../../mocks/auth/users.mock';

/**
 * Service pour gérer les opérations liées aux utilisateurs
 * Fournit des méthodes pour récupérer, mettre à jour et rechercher des profils utilisateurs
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);

  // Signal pour stocker les données de l'utilisateur courant
  private userProfileSig = signal<UserModel | null>(null);

  // Signal exposé pour l'utilisateur courant
  readonly currentUserProfile = computed(() => this.userProfileSig());

  // Cache des profils utilisateurs récupérés
  private userProfilesCache = new Map<number, UserModel>();

  constructor() {
    // Charger automatiquement le profil de l'utilisateur connecté
    if (this.authService.isLoggedIn()) {
      this.loadCurrentUserProfile();
    }
  }

  /**
   * Récupère le profil de l'utilisateur courant et le stocke dans le signal
   */
  private loadCurrentUserProfile(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser?.userId) {
      this.getUserProfile(currentUser.userId).subscribe({
        next: (profile) => this.userProfileSig.set(profile),
        error: (error) => console.error('Erreur lors du chargement du profil utilisateur', error)
      });
    }
  }

  /**
   * Récupère le profil d'un utilisateur par son ID
   * Utilise le cache si disponible, sinon fait une requête API
   * @param userId ID de l'utilisateur
   * @param forceRefresh Force la récupération depuis l'API même si en cache
   */
  getUserProfile(userId: number, forceRefresh = false): Observable<UserModel> {
    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!forceRefresh) {
      // Pour l'utilisateur courant, vérifier d'abord le signal
      if (this.authService.currentUser()?.userId === userId && this.userProfileSig()) {
        return of(this.userProfileSig()!);
      }

      // Sinon vérifier le cache général
      if (this.userProfilesCache.has(userId)) {
        return of(this.userProfilesCache.get(userId)!);
      }
    }

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockGetUserProfile(userId);
    }

    // Appel API réel
    const url = `${this.apiConfig.apiUrl}/users/${userId}`;
    const headers = this.apiConfig.createHeaders();

    return this.http.get<UserModel>(url, { headers }).pipe(
      tap(profile => {
        // Mise en cache du profil
        this.userProfilesCache.set(userId, profile);

        // Si c'est l'utilisateur courant, mettre à jour le signal également
        if (this.authService.currentUser()?.userId === userId) {
          this.userProfileSig.set(profile);
        }
      }),
      catchError(error => this.handleApiError(error, `Impossible de récupérer le profil de l'utilisateur #${userId}`))
    );
  }

  /**
   * Met à jour le profil d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param userData Données à mettre à jour
   */
  updateUserProfile(userId: number, userData: Partial<UserModel>): Observable<UserModel> {
    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockUpdateUserProfile(userId, userData);
    }

    // Appel API réel
    const url = `${this.apiConfig.apiUrl}/users/${userId}`;
    const headers = this.apiConfig.createHeaders();

    return this.http.put<UserModel>(url, userData, { headers }).pipe(
      tap(updatedProfile => {
        // Mise à jour du cache
        this.userProfilesCache.set(userId, updatedProfile);

        // Si c'est l'utilisateur courant, mettre à jour le signal également
        if (this.authService.currentUser()?.userId === userId) {
          this.userProfileSig.set(updatedProfile);
        }

        this.notification.displayNotification(
          'Profil mis à jour avec succès',
          'valid',
          'Fermer'
        );
      }),
      catchError(error => this.handleApiError(error, 'Impossible de mettre à jour le profil'))
    );
  }

  /**
   * Change le mot de passe d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param currentPassword Mot de passe actuel
   * @param newPassword Nouveau mot de passe
   */
  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<boolean> {
    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockChangePassword(userId, currentPassword, newPassword);
    }

    // Appel API réel
    const url = `${this.apiConfig.apiUrl}/users/${userId}/password`;
    const headers = this.apiConfig.createHeaders();
    const data = { currentPassword, newPassword };

    return this.http.post<{ success: boolean }>(url, data, { headers }).pipe(
      map(response => response.success),
      tap(success => {
        if (success) {
          this.notification.displayNotification(
            'Mot de passe modifié avec succès',
            'valid',
            'Fermer'
          );
        }
      }),
      catchError(error => this.handleApiError(error, 'Impossible de modifier le mot de passe'))
    );
  }

  /**
   * Recherche des utilisateurs par nom, prénom ou email
   * @param query Terme de recherche
   */
  searchUsers(query: string): Observable<UserModel[]> {
    if (!query || query.trim().length < 3) {
      return of([]);
    }

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockSearchUsers(query);
    }

    // Appel API réel
    const url = `${this.apiConfig.apiUrl}/users/search`;
    const headers = this.apiConfig.createHeaders();
    const params = { q: query };

    return this.http.get<UserModel[]>(url, { headers, params }).pipe(
      tap(users => {
        // Mise en cache des résultats
        users.forEach(user => {
          if (user.id) {
            this.userProfilesCache.set(user.id, user);
          }
        });
      }),
      catchError(error => this.handleApiError(error, 'Erreur lors de la recherche d\'utilisateurs'))
    );
  }

  /**
   * Génère une URL d'avatar basée sur la première lettre du prénom
   * @param user Utilisateur pour lequel générer l'avatar
   */
  generateAvatarUrl(user: UserModel | null): string {
    if (!user || !user.firstName) {
      return 'assets/images/default-avatar.png';
    }

    // Générer une couleur basée sur les lettres du nom
    const colors = [
      '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#FF9800',
      '#03A9F4', '#E91E63', '#FFEB3B', '#673AB7', '#009688'
    ];

    const letterSum = user.firstName.toLowerCase().charCodeAt(0) +
      (user.lastName ? user.lastName.toLowerCase().charCodeAt(0) : 0);
    const colorIndex = letterSum % colors.length;
    const bgColor = colors[colorIndex];

    // Créer un SVG avec la première lettre du prénom (encode pour URL)
    const letter = encodeURIComponent(user.firstName.charAt(0).toUpperCase());
    const encodedColor = bgColor.replace('#', '%23'); // Encodage # en URL

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='20' fill='${encodedColor}'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' fill='white' text-anchor='middle' dominant-baseline='central'%3E${letter}%3C/text%3E%3C/svg%3E`;
  }

  // === Méthodes mock pour les tests et le développement ===

  /**
   * Version mock de la récupération d'un profil utilisateur
   */
  private mockGetUserProfile(userId: number): Observable<UserModel> {
    // Chercher l'utilisateur dans les mocks
    const mockUser = mockUsers.find(u => u.id === userId);

    if (!mockUser) {
      return this.apiConfig.createMockError(404, `L'utilisateur avec l'ID ${userId} n'existe pas`);
    }

    // Convertir en UserModel
    const userProfile: UserModel = {
      id: mockUser.id,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
      role: mockUser.role,
      structureId: mockUser.structureId,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt
    };

    // Mettre en cache
    this.userProfilesCache.set(userId, userProfile);

    // Si c'est l'utilisateur courant, mettre à jour le signal
    if (this.authService.currentUser()?.userId === userId) {
      this.userProfileSig.set(userProfile);
    }

    return this.apiConfig.createMockResponse(userProfile);
  }

  /**
   * Version mock de la mise à jour d'un profil utilisateur
   */
  private mockUpdateUserProfile(userId: number, userData: Partial<UserModel>): Observable<UserModel> {
    // Trouver l'utilisateur dans les mocks
    const mockUserIndex = mockUsers.findIndex(u => u.id === userId);

    if (mockUserIndex === -1) {
      return this.apiConfig.createMockError(404, `L'utilisateur avec l'ID ${userId} n'existe pas`);
    }

    // Simuler la mise à jour (en gardant une copie de l'original)
    const updatedMockUser = {
      ...mockUsers[mockUserIndex],
      ...userData,
      updatedAt: new Date()
    };

    // Convertir en UserModel pour le retour
    const updatedProfile: UserModel = {
      id: updatedMockUser.id,
      firstName: updatedMockUser.firstName,
      lastName: updatedMockUser.lastName,
      email: updatedMockUser.email,
      role: updatedMockUser.role,
      structureId: updatedMockUser.structureId,
      createdAt: updatedMockUser.createdAt,
      updatedAt: updatedMockUser.updatedAt
    };

    // Mettre à jour le cache
    this.userProfilesCache.set(userId, updatedProfile);

    // Si c'est l'utilisateur courant, mettre à jour le signal
    if (this.authService.currentUser()?.userId === userId) {
      this.userProfileSig.set(updatedProfile);
    }

    return this.apiConfig.createMockResponse(updatedProfile);
  }

  /**
   * Version mock du changement de mot de passe
   */
  private mockChangePassword(userId: number, currentPassword: string, newPassword: string): Observable<boolean> {
    // Trouver l'utilisateur dans les mocks
    const mockUser = mockUsers.find(u => u.id === userId);

    if (!mockUser) {
      return this.apiConfig.createMockError(404, `L'utilisateur avec l'ID ${userId} n'existe pas`);
    }

    // Vérifier si le mot de passe actuel est correct
    if (mockUser.password !== currentPassword) {
      return this.apiConfig.createMockError(400, 'Le mot de passe actuel est incorrect');
    }

    // Simuler un succès (dans une vraie implémentation, le mot de passe serait mis à jour)
    return this.apiConfig.createMockResponse(true);
  }

  /**
   * Version mock de la recherche d'utilisateurs
   */
  private mockSearchUsers(query: string): Observable<UserModel[]> {
    // Rechercher dans les mocks
    const lowercaseQuery = query.toLowerCase();
    const results = mockUsers.filter(user =>
      user.firstName.toLowerCase().includes(lowercaseQuery) ||
      user.lastName.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );

    // Convertir en UserModel pour le retour
    const userResults: UserModel[] = results.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      structureId: user.structureId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    // Mettre en cache les résultats
    userResults.forEach(user => {
      if (user.id) {
        this.userProfilesCache.set(user.id, user);
      }
    });

    return this.apiConfig.createMockResponse(userResults);
  }

  /**
   * Gestion des erreurs API avec notification
   */
  private handleApiError(error: any, defaultMessage: string): Observable<never> {
    console.error(`${defaultMessage}:`, error);

    let message = defaultMessage;

    if (error.status === 401) {
      message = 'Votre session a expiré. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      message = 'Vous n\'avez pas les droits nécessaires pour cette opération.';
    } else if (error.status === 404) {
      message = 'Utilisateur non trouvé.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.notification.displayNotification(message, 'error', 'Fermer');
    return throwError(() => new Error(message));
  }
}
