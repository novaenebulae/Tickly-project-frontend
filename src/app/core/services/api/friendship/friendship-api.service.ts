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
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import { FriendshipApiMockService } from './friendship-api-mock.service';
import { APP_CONFIG } from '../../../config/app-config'; // Adjusted path

// Models and DTOs used by this service (for typing API requests/responses)
import { FriendshipDataModel, SendFriendRequestDto, UpdateFriendshipStatusDto } from '../../../models/friendship/friendship.model';
import { FriendModel } from '../../../models/friendship/friend.model';
import { ReceivedFriendRequestModel, SentFriendRequestModel } from '../../../models/friendship/friend-request.model';
import { UserModel } from '../../../models/user/user.model'; // For search results
import { FriendParticipantDto } from '../../../models/friendship/friend-participant.dto';

@Injectable({
  providedIn: 'root'
})
export class FriendshipApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private mockService = inject(FriendshipApiMockService);

  /**
   * Retrieves the current user's list of friends.
   * Expects an array of raw API DTOs that can be mapped to FriendModel.
   */
  getFriendsList(): Observable<FriendModel[]> { // Type response to FriendModel[] as API should match
    const endpointContext = APP_CONFIG.api.endpoints.friendship.base;

    if (this.apiConfig.isMockEnabledForDomain('friendship')) {
      return this.mockService.mockGetFriendsList();
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<FriendModel[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'getFriendsList'))
    );
  }

  /**
   * Sends a friend request.
   * @param dto - Data for sending the request (e.g., receiverId or receiverEmail).
   * Expects a raw API DTO representing the created friendship record.
   */
  sendFriendRequest(dto: SendFriendRequestDto): Observable<FriendshipDataModel> { // API returns FriendshipDataModel
    const endpointContext = APP_CONFIG.api.endpoints.friendship.requests;

    if (this.apiConfig.isMockEnabledForDomain('friendship')) {
      return this.mockService.mockSendFriendRequest(dto);
    }

    this.apiConfig.logApiRequest('POST', endpointContext, dto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<FriendshipDataModel>(url, dto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'sendFriendRequest'))
    );
  }

  /**
   * Retrieves pending friend requests received by the current user.
   * Expects an array of raw API DTOs that can be mapped to ReceivedFriendRequestModel.
   */
  getPendingRequests(): Observable<ReceivedFriendRequestModel[]> {
    const endpointContext = `${APP_CONFIG.api.endpoints.friendship.requests}?status=pending&type=received`; // Example query params

    if (this.apiConfig.isMockEnabledForDomain('friendship')) {
      return this.mockService.mockGetPendingRequests();
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.friendship.requests);
    const headers = this.apiConfig.createHeaders();
    const params = new HttpParams().set('status', 'pending').set('type', 'received'); // Adjust as per your API

    return this.http.get<ReceivedFriendRequestModel[]>(url, { headers, params }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'getPendingRequests'))
    );
  }

  /**
   * Retrieves friend requests sent by the current user.
   * Expects an array of raw API DTOs that can be mapped to SentFriendRequestModel.
   */
  getSentRequests(): Observable<SentFriendRequestModel[]> {
    const endpointContext = `${APP_CONFIG.api.endpoints.friendship.requests}?type=sent`; // Example query params

    if (this.apiConfig.isMockEnabledForDomain('friendship')) {
      return this.mockService.mockGetSentRequests();
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.friendship.requests);
    const headers = this.apiConfig.createHeaders();
    const params = new HttpParams().set('type', 'sent'); // Adjust as per your API

    return this.http.get<SentFriendRequestModel[]>(url, { headers, params }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'getSentRequests'))
    );
  }

  /**
   * Updates the status of a friendship (e.g., accept, reject, block).
   * @param friendshipId - The ID of the friendship record.
   * @param dto - DTO containing the new status.
   * Expects a raw API DTO of the updated friendship record.
   */
  updateFriendshipStatus(friendshipId: number, dto: UpdateFriendshipStatusDto): Observable<FriendshipDataModel> {
    const endpointContext = APP_CONFIG.api.endpoints.friendship.requestAction(friendshipId);
    // API might use PUT for accept/reject/block and a different payload structure
    // For simplicity, assuming PATCH or PUT with the same DTO. Adjust as needed.

    if (this.apiConfig.isMockEnabledForDomain('friendship')) {
      return this.mockService.mockUpdateFriendshipStatus(friendshipId, dto);
    }

    this.apiConfig.logApiRequest('PUT', endpointContext, dto); // Or PATCH
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.put<FriendshipDataModel>(url, dto, { headers }).pipe( // Or this.http.patch
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, `updateFriendshipStatus (${dto.newStatus})`))
    );
  }

  /**
   * Removes or cancels a friendship.
   * @param friendshipId - The ID of the friendship record.
   */
  removeFriendship(friendshipId: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.friendship.requestAction(friendshipId);

    if (this.apiConfig.isMockEnabledForDomain('friendship')) {
      return this.mockService.mockRemoveFriendship(friendshipId);
    }

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
    // This endpoint might belong to a UserService more logically, but keeping as per original file.
    const endpointContext = APP_CONFIG.api.endpoints.users.search; // Assuming a general user search endpoint

    if (this.apiConfig.isMockEnabledForDomain('friendship')) { // or 'users' if user search is mocked under users domain
      return this.mockService.mockSearchUsers(query);
    }

    this.apiConfig.logApiRequest('GET', endpointContext, { q: query });
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    const params = new HttpParams().set('q', query);

    return this.http.get<Partial<UserModel>[]>(url, { headers, params }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleFriendshipError(error, 'searchUsers')) // Or a generic user search error
    );
  }


  /**
   * Retrieves friends of the current user who are attending a specific event.
   * Expects an array of FriendParticipantDto.
   * @param eventId - The ID of the event.
   */
  getFriendsAttendingEvent(eventId: number): Observable<FriendParticipantDto[]> {
    const endpointContext = APP_CONFIG.api.endpoints.friendship.friendsAttendingEvent(eventId);

    if (this.apiConfig.isMockEnabledForDomain('friendship')) {
      return this.mockService.mockGetFriendsAttendingEvent(eventId);
    }

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
  private handleFriendshipError(error: HttpErrorResponse, context: string): Observable<never> {
    this.apiConfig.logApiError('FRIENDSHIP-API', context, error);
    let userMessage = 'Une erreur est survenue concernant les relations d\'amitié.'; // Message en français
    if (error.status === 404) {
      userMessage = 'Utilisateur ou relation non trouvé(e).';
    } else if (error.status === 403) {
      userMessage = 'Action non autorisée.';
    } else if (error.status === 400) {
      userMessage = 'Données invalides pour la requête d\'amitié.';
    } else if (error.status === 409) { // Conflict
      userMessage = error.error?.message || 'Cette relation existe déjà ou est en conflit avec un état existant.';
    }
    return throwError(() => ({
      status: error.status,
      message: userMessage,
      originalError: error
    }));
  }
}
