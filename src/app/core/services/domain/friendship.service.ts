// src/app/core/services/domain/friendship.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, catchError, map, tap, switchMap } from 'rxjs';
import { FriendshipApiService } from '../api/friendship-api.service';
import { NotificationService } from './notification.service';
import { FriendshipModel, FriendRequestModel, FriendModel } from '../../models/friendship/friendship.model';
import {ApiConfigService} from '../api/api-config.service';
import {FriendshipMockService} from '../../mocks/friendship/friendships.mock';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  private friendshipApi = inject(FriendshipApiService);
  private friendshipMockService = inject(FriendshipMockService);
  private notification = inject(NotificationService);
  private apiConfig = inject(ApiConfigService)

  // Signaux pour stocker les données
  private friendsSig = signal<FriendModel[]>([]);
  private pendingRequestsSig = signal<FriendRequestModel[]>([]);
  private sentRequestsSig = signal<FriendRequestModel[]>([]);

  // Exposer les données en lecture seule
  readonly friends = computed(() => this.friendsSig());
  readonly pendingRequests = computed(() => this.pendingRequestsSig());
  readonly sentRequests = computed(() => this.sentRequestsSig());

  // Obtenir tous les amis
  getFriends(forceRefresh = false): Observable<FriendModel[]> {
    // Si déjà chargé et pas de rafraîchissement forcé
    if (this.friendsSig().length > 0 && !forceRefresh) {
      return of(this.friendsSig());
    }

    return this.friendshipApi.getFriendsList().pipe(
      tap(friends => {
        this.friendsSig.set(friends);
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer vos amis', error);
        return of([]);
      })
    );
  }

  // Obtenir les demandes d'amitié en attente
  getPendingFriendRequests(forceRefresh = false): Observable<FriendRequestModel[]> {
    // Si déjà chargé et pas de rafraîchissement forcé
    if (this.pendingRequestsSig().length > 0 && !forceRefresh) {
      return of(this.pendingRequestsSig());
    }

    return this.friendshipApi.getPendingRequests().pipe(
      tap(requests => {
        this.pendingRequestsSig.set(requests);
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer les demandes d\'amitié', error);
        return of([]);
      })
    );
  }

  // Obtenir les demandes d'amitié envoyées
  getSentFriendRequests(forceRefresh = false): Observable<FriendRequestModel[]> {
    // Si déjà chargé et pas de rafraîchissement forcé
    if (this.sentRequestsSig().length > 0 && !forceRefresh) {
      return of(this.sentRequestsSig());
    }

    return this.friendshipApi.getSentRequests().pipe(
      tap(requests => {
        this.sentRequestsSig.set(requests);
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer vos demandes envoyées', error);
        return of([]);
      })
    );
  }

  // Envoyer une demande d'amitié par email
  sendFriendRequestByEmail(userMail: string): Observable<boolean> {
    // Recherche d'abord l'utilisateur par email
    return this.friendshipApi.searchUsers(userMail).pipe(
      // Vérifie si des utilisateurs ont été trouvés
      switchMap(users => {
        if (!users || users.length === 0) {
          throw new Error('Aucun utilisateur trouvé avec cet email');
        }

        // Vérifie que l'ID existe avant d'envoyer la demande
        const userId = users[0].id;
        if (userId === undefined) {
          throw new Error('ID utilisateur invalide');
        }

        // Envoie la demande d'amitié à l'ID trouvé
        return this.friendshipApi.sendFriendRequest(userId);
      }),
      // Traite la réponse
      map(() => true),
      tap(() => {
        this.notification.displayNotification(
          'Demande d\'amitié envoyée avec succès',
          'valid',
          'Fermer'
        );
        // Rafraîchir les demandes envoyées
        this.refreshSentRequests();
      }),
      catchError(error => {
        this.handleError('Impossible d\'envoyer la demande d\'amitié', error);
        return of(false);
      })
    );
  }

  // Accepter une demande d'amitié
  acceptFriendRequest(requestId: number): Observable<boolean> {
    return this.friendshipApi.acceptFriendRequest(requestId).pipe(
      map(() => true),
      tap(() => {
        this.notification.displayNotification(
          'Demande d\'amitié acceptée',
          'valid',
          'Fermer'
        );
        // Rafraîchir les amis et les demandes en attente
        this.refreshFriends();
        this.refreshPendingRequests();
      }),
      catchError(error => {
        this.handleError('Impossible d\'accepter la demande d\'amitié', error);
        return of(false);
      })
    );
  }

  // Rejeter une demande d'amitié
  rejectFriendRequest(requestId: number): Observable<boolean> {
    return this.friendshipApi.rejectFriendRequest(requestId).pipe(
      map(() => true),
      tap(() => {
        this.notification.displayNotification(
          'Demande d\'amitié rejetée',
          'info',
          'Fermer'
        );
        // Rafraîchir les demandes en attente
        this.refreshPendingRequests();
      }),
      catchError(error => {
        this.handleError('Impossible de rejeter la demande d\'amitié', error);
        return of(false);
      })
    );
  }

  // Bloquer un utilisateur
  blockUser(userId: number): Observable<boolean> {
    return this.friendshipApi.blockUser(userId).pipe(
      map(() => true),
      tap(() => {
        this.notification.displayNotification(
          'Utilisateur bloqué avec succès',
          'info',
          'Fermer'
        );
        // Rafraîchir les amis
        this.refreshFriends();
      }),
      catchError(error => {
        this.handleError('Impossible de bloquer cet utilisateur', error);
        return of(false);
      })
    );
  }

  // Supprimer une amitié
  removeFriend(friendshipId: number): Observable<boolean> {
    return this.friendshipApi.removeFriendship(friendshipId).pipe(
      map(() => true),
      tap(() => {
        this.notification.displayNotification(
          'Ami supprimé de votre liste',
          'info',
          'Fermer'
        );
        // Rafraîchir les amis
        this.refreshFriends();
      }),
      catchError(error => {
        this.handleError('Impossible de supprimer cet ami', error);
        return of(false);
      })
    );
  }

  // Rechercher des utilisateurs
  searchUsers(query: string): Observable<any[]> {
    if (!query || query.trim().length < 3) {
      return of([]);
    }

    return this.friendshipApi.searchUsers(query).pipe(
      catchError(error => {
        this.handleError('Erreur lors de la recherche d\'utilisateurs', error);
        return of([]);
      })
    );
  }

  // Dans src/app/core/services/domain/friendship.service.ts
// Assurons-nous que la méthode utilise le bon service selon le contexte

  getFriendsAttendingEvent(eventId: number): Observable<any[]> {
    // Sinon, utiliser l'API réelle
    if (this.apiConfig.isMockEnabled) {
      return of(this.friendshipMockService.getMockFriendsAttendingEvent(eventId));
    }
    return this.friendshipApi.getFriendsAttendingEvent(eventId).pipe(
      catchError(error => {
        this.handleError('Impossible de récupérer les amis participant à cet événement', error);
        return of([]);
      })
    );
  }

  // Méthodes privées de rafraîchissement des données
  private refreshFriends(): void {
    this.friendshipApi.getFriendsList().subscribe({
      next: (friends) => this.friendsSig.set(friends),
      error: (error) => console.error('Erreur lors du rafraîchissement des amis', error)
    });
  }

  private refreshPendingRequests(): void {
    this.friendshipApi.getPendingRequests().subscribe({
      next: (requests) => this.pendingRequestsSig.set(requests),
      error: (error) => console.error('Erreur lors du rafraîchissement des demandes en attente', error)
    });
  }

  private refreshSentRequests(): void {
    this.friendshipApi.getSentRequests().subscribe({
      next: (requests) => this.sentRequestsSig.set(requests),
      error: (error) => console.error('Erreur lors du rafraîchissement des demandes envoyées', error)
    });
  }

  // Gestion des erreurs
  private handleError(message: string, error: any): void {
    console.error(`${message}:`, error);
    this.notification.displayNotification(
      message,
      'error',
      'Fermer'
    );
  }
}
