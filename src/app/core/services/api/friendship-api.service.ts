// src/app/core/services/api/friendship-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { FriendshipModel, FriendRequestModel, FriendModel } from '../../models/friendship/friendship.model';

@Injectable({
  providedIn: 'root'
})
export class FriendshipApiService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private baseUrl = `${this.apiConfig.apiUrl}/friendships`;

  // Récupérer la liste des amis de l'utilisateur
  getFriendsList(): Observable<FriendModel[]> {
    return this.http.get<FriendModel[]>(`${this.baseUrl}/friends`);
  }

  // Envoyer une demande d'amitié
  sendFriendRequest(userId: number): Observable<FriendshipModel> {
    return this.http.post<FriendshipModel>(`${this.baseUrl}/request`, { receiverId: userId });
  }

  // Obtenir les demandes d'amitié en attente
  getPendingRequests(): Observable<FriendRequestModel[]> {
    return this.http.get<FriendRequestModel[]>(`${this.baseUrl}/pending`);
  }

  // Obtenir les demandes d'amitié envoyées
  getSentRequests(): Observable<FriendRequestModel[]> {
    return this.http.get<FriendRequestModel[]>(`${this.baseUrl}/sent`);
  }

  // Accepter une demande d'amitié
  acceptFriendRequest(requestId: number): Observable<FriendshipModel> {
    return this.http.patch<FriendshipModel>(`${this.baseUrl}/${requestId}/accept`, {});
  }

  // Rejeter une demande d'amitié
  rejectFriendRequest(requestId: number): Observable<FriendshipModel> {
    return this.http.patch<FriendshipModel>(`${this.baseUrl}/${requestId}/reject`, {});
  }

  // Bloquer un utilisateur
  blockUser(userId: number): Observable<FriendshipModel> {
    return this.http.post<FriendshipModel>(`${this.baseUrl}/block`, { blockedUserId: userId });
  }

  // Supprimer une amitié
  removeFriendship(friendshipId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${friendshipId}`);
  }

  // Rechercher des utilisateurs pour ajouter en ami
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiConfig.apiUrl}/users/search?q=${encodeURIComponent(query)}`);
  }
}
