// src/app/core/services/domain/friendship.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { FriendshipApiService } from '../api/friendship-api.service';
import { NotificationService } from './notification.service';
import { FriendshipModel, FriendRequestModel, FriendModel } from '../../models/friendship/friendship.model';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  private friendshipApi = inject(FriendshipApiService);
  private notification = inject(NotificationService);

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

  // Envoyer une demande d'amitié
  sendFriendRequest(userId: number): Observable<boolean> {
    return this.friendshipApi.sendFriendRequest(userId).pipe(
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
