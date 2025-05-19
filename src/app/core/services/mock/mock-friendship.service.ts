// src/app/core/services/mock/mock-friendship.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FriendshipModel, FriendRequestModel, FriendModel } from '../../models/friendship/friendship.model';
import { FriendshipMockService } from '../../mocks/friendship/friendships.mock';

/**
 * Version mockée du service d'amitié pour le développement et les tests
 */
@Injectable({
  providedIn: 'root'
})
export class MockFriendshipService {
  private friendshipMock = inject(FriendshipMockService);

  // Mapping vers les méthodes mock
  private mockMethods = this.friendshipMock.provideMockData();

  // Obtenir tous les amis
  getFriends(forceRefresh = false): Observable<FriendModel[]> {
    return this.mockMethods.getFriendsList();
  }

  // Obtenir les demandes d'amitié en attente
  getPendingFriendRequests(forceRefresh = false): Observable<FriendRequestModel[]> {
    return this.mockMethods.getPendingRequests();
  }

  // Obtenir les demandes d'amitié envoyées
  getSentFriendRequests(forceRefresh = false): Observable<FriendRequestModel[]> {
    return this.mockMethods.getSentRequests();
  }

  // Envoyer une demande d'amitié
  sendFriendRequest(userId: number): Observable<boolean> {
    // Simuler un succès
    return of(true);
  }

  // Accepter une demande d'amitié
  acceptFriendRequest(requestId: number): Observable<boolean> {
    // Simuler un succès
    return of(true);
  }

  // Rejeter une demande d'amitié
  rejectFriendRequest(requestId: number): Observable<boolean> {
    // Simuler un succès
    return of(true);
  }

  // Bloquer un utilisateur
  blockUser(userId: number): Observable<boolean> {
    // Simuler un succès
    return of(true);
  }

  // Supprimer une amitié
  removeFriend(friendshipId: number): Observable<boolean> {
    // Simuler un succès
    return of(true);
  }

  // Rechercher des utilisateurs
  searchUsers(query: string): Observable<any[]> {
    return this.mockMethods.searchUsers(query);
  }
}
