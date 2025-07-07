/**
 * @file API service for friendship-related operations.
 * Handles HTTP requests for friendships and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {inject, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {ApiConfigService} from '../api-config.service';
import {APP_CONFIG} from '../../../config/app-config'; // Adjusted path
// Models and DTOs used by this service (for typing API requests/responses)
import {
  FriendshipDataModel,
  SendFriendRequestDto,
  UpdateFriendshipStatusDto
} from '../../../models/friendship/friendship.model';
import {UserModel} from '../../../models/user/user.model'; // For search results
import {FriendParticipantDto} from '../../../models/friendship/friend-participant.dto';
import {FriendsData} from '../../domain/user/friendship.service';
import {ErrorHandlingService} from '../../error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class FriendshipApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private errorHandler = inject(ErrorHandlingService);

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
   * Uses the centralized ErrorHandlingService to provide consistent error handling.
   * @param error - The HttpErrorResponse.
   * @param context - A string describing the context of the error.
   */
   handleFriendshipError(error: HttpErrorResponse, context: string): Observable<never> {
    // Déterminer le message d'erreur en fonction du statut
    let userMessage: string;

    if (error.status === 404) {
      userMessage = 'Utilisateur ou relation non trouvé(e).';
    } else if (error.status === 403) {
      userMessage = 'Action non autorisée.';
    } else if (error.status === 400) {
      userMessage = 'Données invalides pour la requête d\'amitié.';
    } else if (error.status === 409) {
      userMessage = error.error?.message || 'Cette relation existe déjà ou est en conflit avec un état existant.';
    } else {
      // Si aucun cas spécifique n'est trouvé, utiliser le message par défaut du service
      return this.errorHandler.handleHttpError(error, `friendship-${context}`);
    }

    // Utiliser le service d'erreur avec le message personnalisé
    return this.errorHandler.handleGeneralError(userMessage, error, `friendship-${context}`);
  }
}
