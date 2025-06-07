/**
 * @file API service for user-related operations (profile, search, etc.).
 * Handles HTTP requests for user data and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import { UserApiMockService } from './user-api-mock.service';
import { APP_CONFIG } from '../../../config/app-config';
import { UserModel } from '../../../models/user/user.model';
import { UserProfileUpdateDto } from '../../../models/user/user-profile-update.dto';
import {FavoriteStructureDto, UserFavoriteStructureModel} from '../../../models/user/user-favorite-structure.model';
import {Role, TeamMember} from '../../../models/user/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private mockService = inject(UserApiMockService);

  /**
   * Retrieves the profile of the currently authenticated user.
   * The API is expected to return data that maps directly to `UserModel`.
   * @returns An Observable of `UserModel` or undefined if an error occurs.
   */
  getCurrentUserProfile(): Observable<UserModel> { // Changed return type
    const endpointContext = APP_CONFIG.api.endpoints.users.profile;

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockGetCurrentUserProfile();
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<UserModel>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'getCurrentUserProfile'))
    );
  }

  /**
   * Retrieves a specific user's profile by their ID.
   * The API is expected to return data that maps directly to `UserModel`.
   * @param userId - The ID of the user whose profile is to be fetched.
   * @returns An Observable of `UserModel` or undefined if an error occurs.
   */
  getUserProfileById(userId: number): Observable<UserModel> { // Changed return type
    const endpointContext = APP_CONFIG.api.endpoints.users.byId(userId);

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockGetUserProfileById(userId);
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<UserModel>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'getUserProfileById'))
    );
  }

  /**
   * Updates the profile of the currently authenticated user.
   * @param profileUpdateDto - A DTO containing the fields to be updated.
   * The API is expected to return the updated user profile data (mappable to `UserModel`).
   * @returns An Observable of the updated `UserModel` or undefined if an error occurs.
   */
  updateCurrentUserProfile(profileUpdateDto: UserProfileUpdateDto): Observable<UserModel> { // Changed return type
    const endpointContext = APP_CONFIG.api.endpoints.users.updateProfile; // e.g., 'users/me'

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockUpdateCurrentUserProfile(profileUpdateDto);
    }

    this.apiConfig.logApiRequest('PUT', endpointContext, profileUpdateDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.put<UserModel>(url, profileUpdateDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'updateCurrentUserProfile'))
    );
  }

  /**
   * Searches for users based on a query string (e.g., name or email).
   * The API is expected to return an array of partial user data.
   * @param query - The search term.
   * @returns An Observable of an array of `Partial<UserModel>` objects.
   */
  searchUsers(query: string): Observable<Partial<UserModel>[]> {
    const endpointContext = APP_CONFIG.api.endpoints.users.search;

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockSearchUsers(query);
    }

    this.apiConfig.logApiRequest('GET', endpointContext, { q: query });
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    const params = new HttpParams().set('q', query); // Assuming API expects 'q' for query

    return this.http.get<Partial<UserModel>[]>(url, { headers, params }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'searchUsers'))
    );
  }

  /**
   * Retrieves all favorite structures for the current authenticated user.
   * @returns An Observable of an array of `UserFavoriteStructureModel`.
   */
  getUserFavoriteStructures(): Observable<UserFavoriteStructureModel[]> {
    const endpointContext = 'users/favorites'; // Assuming endpoint like 'users/me/favorites'

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockGetUserFavoriteStructures();
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<UserFavoriteStructureModel[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'getUserFavoriteStructures'))
    );
  }

  /**
   * Adds a structure to the current user's favorites.
   * @param structureId - The ID of the structure to add to favorites.
   * @returns An Observable of the created `UserFavoriteStructureModel`.
   */
  addStructureToFavorites(structureId: number): Observable<UserFavoriteStructureModel> {
    const endpointContext = 'users/favorites';
    const favoriteDto: FavoriteStructureDto = { structureId };

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockAddStructureToFavorites(structureId);
    }

    this.apiConfig.logApiRequest('POST', endpointContext, favoriteDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<UserFavoriteStructureModel>(url, favoriteDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'addStructureToFavorites'))
    );
  }

  /**
   * Removes a structure from the current user's favorites.
   * @param structureId - The ID of the structure to remove from favorites.
   * @returns An Observable of void.
   */
  removeStructureFromFavorites(structureId: number): Observable<void> {
    const endpointContext = `users/favorites/${structureId}`;

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockRemoveStructureFromFavorites(structureId);
    }

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('DELETE', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'removeStructureFromFavorites'))
    );
  }

  /**
   * Checks if a structure is in the current user's favorites.
   * @param structureId - The ID of the structure to check.
   * @returns An Observable of boolean indicating if the structure is a favorite.
   */
  isStructureFavorite(structureId: number): Observable<boolean> {
    // Validation du paramètre
    if (!structureId || structureId <= 0) {
      return throwError(() => ({
        status: 400,
        message: 'ID de structure invalide',
        originalError: null
      }));
    }

    const endpointContext = `users/favorites/${structureId}/exists`;
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockIsStructureFavorite(structureId);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<{ isFavorite: boolean }>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'isStructureFavorite')),
      map(response => response?.isFavorite ?? false)
    );
  }



  /**
   * Handles errors from User API calls.
   * @param error - The HttpErrorResponse received from the HTTP client.
   * @param context - A string describing the operation during which the error occurred.
   * @returns An Observable that emits a custom error object.
   */
  private handleUserError(error: HttpErrorResponse, context: string): Observable<never> {
    this.apiConfig.logApiError('USER-API', context, error);
    let userMessage = "Une erreur est survenue lors de l'opération sur l'utilisateur."; // Default message in French

    if (error.status === 404) {
      userMessage = "Utilisateur non trouvé.";
    } else if (error.status === 403) {
      userMessage = "Vous n'êtes pas autorisé à effectuer cette action.";
    } else if (error.status === 400) {
      userMessage = "Les données fournies pour l'utilisateur sont incorrectes.";
    } else if (error.status === 409) { // Conflict, e.g., email already exists if API handles it this way
      userMessage = error.error?.message || "Un conflit de données est survenu (ex: email déjà utilisé).";
    }
    // For other errors, the default message is used.

    return throwError(() => ({
      status: error.status,
      message: userMessage, // User-friendly message for display
      originalError: error  // The original HttpErrorResponse for debugging or more detailed handling
    }));
  }


}
