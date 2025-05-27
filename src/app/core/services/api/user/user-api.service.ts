/**
 * @file API service for user-related operations (profile, search, etc.).
 * Handles HTTP requests for user data and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import { UserApiMockService } from './user-api-mock.service';
import { APP_CONFIG } from '../../../config/app-config';
import { UserModel } from '../../../models/user/user.model';
import { UserProfileUpdateDto } from '../../../models/user/user-profile-update.dto';

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
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockGetCurrentUserProfile();
    }

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
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockGetUserProfileById(userId);
    }

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
    this.apiConfig.logApiRequest('PUT', endpointContext, profileUpdateDto);

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockUpdateCurrentUserProfile(profileUpdateDto);
    }

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
    this.apiConfig.logApiRequest('GET', endpointContext, { q: query });

    if (this.apiConfig.isMockEnabledForDomain('users')) {
      return this.mockService.mockSearchUsers(query);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    const params = new HttpParams().set('q', query); // Assuming API expects 'q' for query

    return this.http.get<Partial<UserModel>[]>(url, { headers, params }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleUserError(error, 'searchUsers'))
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
