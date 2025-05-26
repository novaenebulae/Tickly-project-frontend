// src/app/core/services/api/friendship-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { FriendshipModel, FriendRequestModel, FriendModel } from '../../models/friendship/friendship.model';
import { UserModel } from '../../models/auth/user.model';

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
    // Assurons-nous que userId est bien un nombre
    const receiverId: number = userId;
    return this.http.post<FriendshipModel>(`${this.baseUrl}/request`, { receiverId });
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

  // Rechercher des utilisateurs pour ajouter en ami (par nom ou email)
  searchUsers(query: string): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.apiConfig.apiUrl}/users/search?q=${encodeURIComponent(query)}`);
  }

  // Rechercher un utilisateur spécifiquement par email
  searchUserByEmail(email: string): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.apiConfig.apiUrl}/users/search?email=${encodeURIComponent(email)}`);
  }

  getFriendsAttendingEvent(eventId: number): Observable<FriendModel[]> {
    return this.http.get<FriendModel[]>(`${this.apiConfig.apiUrl}/events/${eventId}/friends`);
  }
}
