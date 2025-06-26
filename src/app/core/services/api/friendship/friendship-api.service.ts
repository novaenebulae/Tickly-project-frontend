// src/app/core/services/api/friendship-api.service.ts

/**
 * @file API service for friendship-related operations.
 * Handles HTTP requests for friendships and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import { APP_CONFIG } from '../../../config/app-config'; // Adjusted path

// Models and DTOs used by this service (for typing API requests/responses)
import { FriendshipDataModel, SendFriendRequestDto, UpdateFriendshipStatusDto } from '../../../models/friendship/friendship.model';
import { FriendModel } from '../../../models/friendship/friend.model';
import { ReceivedFriendRequestModel, SentFriendRequestModel } from '../../../models/friendship/friend-request.model';
import { UserModel } from '../../../models/user/user.model'; // For search results
import { FriendParticipantDto } from '../../../models/friendship/friend-participant.dto';
import { FriendsData } from '../../domain/user/friendship.service';

@Injectable({
  providedIn: 'root'
})
export class FriendshipApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;

  /**
   * Retrieves all friends data (friends, pending requests, sent requests) in a single call.
   * This is the primary endpoint that consolidates all friendship-related data.
   */
  getFriendsData(): Observable<FriendsData> {
    const endpointContext = APP_CONFIG.api.endpoints.friendship.base;

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<FriendsData>(url, { headers }).pipe(
      tap(data => this.apiConfig.logApiResponse('GET', endpointContext, data)),
      catchError(error => this.handleFriendshipError(error, 'getFriendsData'))
    );
  }


  /**
   * @deprecated Use getFriendsData() instead and extract friends from the response
   */
  getFriendsList(): Observable<FriendModel[]> {
    return this.getFriendsData().pipe(
      map(data => data.friends)
    );
  }

  /**
   * @deprecated Use getFriendsData() instead and extract pendingRequests from the response
   */
  getPendingRequests(): Observable<ReceivedFriendRequestModel[]> {
    return this.getFriendsData().pipe(
      map(data => data.pendingRequests)
    );
  }

  /**
   * @deprecated Use getFriendsData() instead and extract sentRequests from the response
   */
  getSentRequests(): Observable<SentFriendRequestModel[]> {
    return this.getFriendsData().pipe(
      map(data => data.sentRequests)
    );
  }

  /**
   * Sends a new friend request using the receiver's email.
   * @param dto The data transfer object containing the email.
   */
  sendFriendRequest(dto: SendFriendRequestDto): Observable<FriendshipDataModel> {
    const endpointContext = APP_CONFIG.api.endpoints.friendship.requests;
    this.apiConfig.logApiRequest('POST', endpointContext, dto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<FriendshipDataModel>(url, dto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'sendFriendRequest'))
    );
  }


  /**
   * Updates the status of a friend request (e.g., accept, reject).
   * @param friendshipId - The ID of the friendship record to update.
   * @param dto - The data containing the new status.
   * Expects a raw API DTO representing the updated friendship record.
   */
  updateFriendshipStatus(friendshipId: number, dto: UpdateFriendshipStatusDto): Observable<FriendshipDataModel> {
    const endpointContext = `${APP_CONFIG.api.endpoints.friendship.requests}/${friendshipId}`;

    this.apiConfig.logApiRequest('PUT', endpointContext, dto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.put<FriendshipDataModel>(url, dto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'updateFriendshipStatus'))
    );
  }


  /**
   * Removes or cancels a friendship.
   * @param friendId - The ID of the friendship record.
   */
  removeFriendship(friendId: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.friendship.removeAction(friendId);

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'Friendship removed/cancelled')),
      catchError(error => this.handleFriendshipError(error, 'removeFriendship'))
    );
  }

  /**
   * Searches for users (e.g., to add as friends).
   * Expects an array of raw API DTOs (partial UserModel).
   * @param query - Search term (name or email).
   */
  searchUsers(query: string): Observable<Partial<UserModel>[]> {
    const endpointContext = APP_CONFIG.api.endpoints.users.search;


    this.apiConfig.logApiRequest('GET', endpointContext, { q: query });
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    const params = new HttpParams().set('q', query);

    return this.http.get<Partial<UserModel>[]>(url, { headers, params }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'searchUsers'))
    );
  }

  /**
   * Retrieves friends of the current user who are attending a specific event.
   * Expects an array of FriendParticipantDto.
   * @param eventId - The ID of the event.
   */
  getFriendsAttendingEvent(eventId: number): Observable<FriendParticipantDto[]> {
    const endpointContext = APP_CONFIG.api.endpoints.friendship.friendsAttendingEvent(eventId);

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<FriendParticipantDto[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'getFriendsAttendingEvent'))
    );
  }

  /**
   * Handles errors from friendship API calls.
   * @param error - The HttpErrorResponse.
   * @param context - A string describing the context of the error.
   */
   handleFriendshipError(error: HttpErrorResponse, context: string): Observable<never> {
    this.apiConfig.logApiError('FRIENDSHIP-API', context, error);
    // if (error.status === 404) {
    //   userMessage = 'Utilisateur ou relation non trouvé(e).';
    // } else if (error.status === 403) {
    //   userMessage = 'Action non autorisée.';
    // } else if (error.status === 400) {
    //   userMessage = 'Données invalides pour la requête d\'amitié.';
    // } else if (error.status === 409) {
    //   userMessage = error.error?.message || 'Cette relation existe déjà ou est en conflit avec un état existant.';
    // }
    return throwError(() => ({
      status: error.status,
      message: error.error.message,
      originalError: error
    }));
  }
}
