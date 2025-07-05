/**
 * @file API service for user-related operations (profile, search, etc.).
 * Handles HTTP requests for user data and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

interface AvatarUploadResponse {
  fileName: string;
  fileUrl: string;
  message: string;
}

interface AccountDeletionResponse {
  message: string;
  emailSent: boolean;
}


import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';


import {ApiConfigService} from '../api-config.service';
import {APP_CONFIG} from '../../../config/app-config';
import {UserModel} from '../../../models/user/user.model';
import {UserProfileUpdateDto} from '../../../models/user/user-profile-update.dto';
import {FavoriteStructureDto, UserFavoriteStructureModel} from '../../../models/user/user-favorite-structure.model';
import {catchError, map, tap} from 'rxjs/operators';
import {ErrorHandlingService} from '../../error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlingService);

  /**
   * Retrieves the profile of the currently authenticated user.
   * Endpoint: GET /api/v1/users/me
   * Response format:
   * {
   *   "id": 0,
   *   "firstName": "string",
   *   "lastName": "string",
   *   "email": "string",
   *   "role": "SPECTATOR",
   *   "structureId": 0,
   *   "avatarUrl": "string",
   *   "createdAt": "2025-06-24T09:53:23.562Z",
   *   "updatedAt": "2025-06-24T09:53:23.562Z",
   * }
   * @returns An Observable of `UserModel` or undefined if an error occurs.
   */
  getCurrentUserProfile(): Observable<UserModel> {
    const endpointContext = APP_CONFIG.api.endpoints.users.profile;

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<UserModel>(url, { headers }).pipe(
      // Transformer les dates string en objets Date si nécessaire
      map(response => ({
        ...response,
        createdAt: response.createdAt ? new Date(response.createdAt) : undefined,
        updatedAt: response.updatedAt ? new Date(response.updatedAt) : undefined
      })),
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.errorHandler.handleHttpError(error, 'getCurrentUserProfile'))
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
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<UserModel>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.errorHandler.handleHttpError(error, 'getUserProfileById'))
    );
  }

  /**
   * Updates the profile of the currently authenticated user.
   * Endpoint: PUT /api/v1/users/me
   * Payload: {
   *   "firstName": "string",
   *   "lastName": "string",
   *   "email": "string"
   * }
   * @param profileUpdateDto - A DTO containing the fields to be updated.
   * The API is expected to return the updated user profile data (mappable to `UserModel`).
   * @returns An Observable of the updated `UserModel` or undefined if an error occurs.
   */
  updateCurrentUserProfile(profileUpdateDto: UserProfileUpdateDto): Observable<UserModel> {
    const endpointContext = APP_CONFIG.api.endpoints.users.updateProfile;

    this.apiConfig.logApiRequest('PUT', endpointContext, profileUpdateDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.put<UserModel>(url, profileUpdateDto, { headers }).pipe(
      // Transformer les dates string en objets Date si nécessaire
      map(response => ({
        ...response,
        createdAt: response.createdAt ? new Date(response.createdAt) : undefined,
        updatedAt: response.updatedAt ? new Date(response.updatedAt) : undefined
      })),
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.errorHandler.handleHttpError(error, 'updateCurrentUserProfile'))
    );
  }

  /**
   * Envoie un nouvel avatar pour l'utilisateur actuellement authentifié.
   * Endpoint: POST /api/v1/users/me/avatar
   * @param file Le fichier image à uploader.
   * @returns Un Observable de la réponse d'upload contenant l'URL du fichier.
   */
  uploadAvatar(file: File): Observable<AvatarUploadResponse> {
    const endpointContext = 'users/me/avatar';

    const url = this.apiConfig.getUrl(endpointContext);
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Utilisation des en-têtes spécifiques pour FormData
    const headers = this.apiConfig.createFormDataHeaders();

    this.apiConfig.logApiRequest('POST', url, 'FormData with file');
    return this.http.post<AvatarUploadResponse>(url, formData, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', url, response)),
      catchError(error => this.errorHandler.handleHttpError(error, 'uploadAvatar'))
    );
  }

  /**
   * Demande la suppression du compte utilisateur.
   * Déclenche l'envoi d'un email avec un lien de confirmation.
   * Endpoint: DELETE /api/v1/users/me
   * @returns Un Observable vide (statut 200 OK seulement).
   */
  requestAccountDeletion(): Observable<void> {
    const endpointContext = 'users/me';

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'OK')),
      catchError(error => this.errorHandler.handleHttpError(error, 'requestAccountDeletion'))
    );
  }

  /**
   * Confirme et finalise la suppression du compte en utilisant un token.
   * Endpoint: DELETE /api/v1/users/confirm-deletion?token=xxx
   * Cette requête ne nécessite pas de token JWT car elle est publique mais sécurisée par le token unique.
   * @param token Le token de confirmation reçu par email.
   * @returns Un Observable qui complète sur succès (200 OK).
   */
  confirmAccountDeletion(token: string): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.users.confirmAccountDeletion;

    // Pas de mock nécessaire pour cette logique de confirmation.

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);

    // Le token est passé comme paramètre de requête, pas dans le header.
    const params = new HttpParams().set('token', token);

    // On utilise des headers vides car l'intercepteur JWT ne doit pas s'appliquer
    // de la même manière. Le token dans l'URL est l'autorisation.
    const headers = this.apiConfig.createHeaders();


    // La réponse attendue est probablement un 200 OK avec un corps vide ou un message.
    return this.http.delete(url, { headers, params, responseType: 'json' }).pipe(
      tap(response => this.apiConfig.logApiResponse('DELETE', endpointContext, response)),
      catchError(error => this.errorHandler.handleHttpError(error, 'confirmAccountDeletion'))
    );
  }

  /**
   * Retrieves the favorite structures for the current user.
   * The API is expected to return an array of `UserFavoriteStructureModel`.
   * @returns An Observable of `UserFavoriteStructureModel[]`.
   */
  getUserFavoriteStructures(): Observable<UserFavoriteStructureModel[]> {
    const endpointContext = APP_CONFIG.api.endpoints.users.favorites.structures;

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<UserFavoriteStructureModel[]>(url, { headers }).pipe(
      map(favorites => favorites.map(fav => ({
        ...fav,
        // Assurer la conversion de la date string en objet Date
        addedAt: new Date(fav.addedAt)
      }))),
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.errorHandler.handleHttpError(error, 'getUserFavoriteStructures'))
    );
  }

  /**
   * Adds a structure to the user's favorites.
   * The API is expected to return the newly created `UserFavoriteStructureModel`.
   * @param dto - A DTO containing the structure ID to add.
   * @returns An Observable of the new `UserFavoriteStructureModel`.
   */
  addFavoriteStructure(dto: FavoriteStructureDto): Observable<UserFavoriteStructureModel> {
    const endpointContext = APP_CONFIG.api.endpoints.users.favorites.structures;

    this.apiConfig.logApiRequest('POST', endpointContext, dto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<UserFavoriteStructureModel>(url, dto, { headers }).pipe(
      map(newFavorite => ({
        ...newFavorite,
        // Assurer la conversion de la date
        addedAt: new Date(newFavorite.addedAt)
      })),
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.errorHandler.handleHttpError(error, 'addFavoriteStructure'))
    );
  }

  /**
   * Removes a structure from the user's favorites.
   * The API is expected to return a 204 No Content on success.
   * @param structureId - The ID of the structure to remove.
   * @returns An Observable<void>.
   */
  removeFavoriteStructure(structureId: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.users.favorites.structureById(structureId);


    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, { status: 'Success' })),
      catchError(error => this.errorHandler.handleHttpError(error, 'removeFavoriteStructure'))
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
      return this.errorHandler.handleGeneralError('ID de structure invalide', null, 'isStructureFavorite');
    }

    const endpointContext = `users/favorites/${structureId}/exists`;
    this.apiConfig.logApiRequest('GET', endpointContext);


    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<{ isFavorite: boolean }>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.errorHandler.handleHttpError(error, 'isStructureFavorite')),
      map(response => response?.isFavorite ?? false)
    );
  }




}
