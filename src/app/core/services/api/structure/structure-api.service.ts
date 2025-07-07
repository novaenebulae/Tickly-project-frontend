/**
 * @file API service for structure-related operations.
 * Handles HTTP requests for structures and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {inject, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpParams} from '@angular/common/http'; // HttpParams might not be needed if no query params for some methods
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {ApiConfigService} from '../api-config.service';
import {APP_CONFIG} from '../../../config/app-config'; // Adjusted path assuming config is one level up from core
// DTOs for API interaction
import {StructureCreationResponseDto} from '../../../models/structure/structure.model'; // Assuming structure.model.ts has DTOs
import {StructureSearchParams} from '../../../models/structure/structure-search-params.model';
import {FileUploadResponseDto} from '../../../models/files/file-upload-response.model';
import {StructureAreaModel} from '../../../models/structure/structure-area.model';
import {ErrorHandlingService} from '../../error-handling.service';


@Injectable({
  providedIn: 'root'
})
export class StructureApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private errorHandler = inject(ErrorHandlingService);

  /**
   * Retrieves structures based on search parameters.
   * Backend is expected to include 'importance' and 'eventsCount' by default.
   * Returns raw API DTOs.
   * @param params - Search parameters.
   */
  getStructures(params: StructureSearchParams = {}): Observable<any[]> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.base;

    this.apiConfig.logApiRequest('GET', endpointContext, params);
    const httpParams = this.createHttpParamsFromStructureSearchParams(params);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<any[]>(url, { headers, params: httpParams }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getStructures'))
    );
  }

  /**
   * Retrieves a single structure by its ID.
   * Backend is expected to include 'importance' and 'eventsCount' by default.
   * Returns a raw API DTO.
   * @param id - The ID of the structure.
   */
  getStructureById(id: number): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.byId(id);

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<any>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getStructureById'))
    );
  }

  private createHttpParamsFromStructureSearchParams(params: StructureSearchParams): HttpParams {
    let httpParams = new HttpParams();

    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key as keyof StructureSearchParams];

        if (value === undefined || value === null || value === '') {
          continue;
        }

        // Ignorer les clés de tri car elles seront traitées séparément
        if (key === 'sortBy' || key === 'sortDirection') {
          continue;
        }

        httpParams = httpParams.set(key, String(value));
      }
    }

    // Construire le paramètre 'sort' unique
    if (params.sortBy && params.sortDirection) {
      const sortValue = `${params.sortBy},${params.sortDirection}`;
      httpParams = httpParams.set('sort', sortValue);
    }

    return httpParams;
  }

  /**
   * Creates a new structure.
   * @param structureApiDto - The DTO for creating the structure (raw API format).
   */
  createStructure(structureApiDto: any): Observable<StructureCreationResponseDto> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.base; // Using base create endpoint
    this.apiConfig.logApiRequest('POST', endpointContext, structureApiDto);

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<StructureCreationResponseDto>(url, structureApiDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'createStructure'))
    );
  }

  /**
   * Updates an existing structure.
   * @param id - The ID of the structure to update.
   * @param structureApiDto - Partial DTO with fields to update (raw API format).
   */
  updateStructure(id: number, structureApiDto: Partial<any>): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.byId(id);
    this.apiConfig.logApiRequest('PATCH', endpointContext, structureApiDto);

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.patch<any>(url, structureApiDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PATCH', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'updateStructure'))
    );
  }

  /**
   * Upload une image pour la structure (logo ou couverture)
   * @param structureId ID de la structure
   * @param file Le fichier image à uploader
   * @param type Le type d'image ('logo' ou 'cover')
   * @returns Observable contenant l'URL de l'image uploadée
   */
  uploadStructureImage(structureId: number, file: File, type: 'logo' | 'cover'): Observable<FileUploadResponseDto> {
    const endpointContext = `structures/${structureId}/${type}`;

    const url = this.apiConfig.getUrl(endpointContext);
    const formData = new FormData();
    formData.append('file', file, file.name);

    const headers = this.apiConfig.createFormDataHeaders();

    this.apiConfig.logApiRequest('POST', endpointContext, 'FormData with file');
    return this.http.post<{ fileName: string; fileUrl: string; message: string }>(url, formData, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'uploadStructureImage'))
    );
  }

  /**
   * Upload multiple images pour la galerie de la structure (nouveau endpoint)
   * @param structureId ID de la structure
   * @param files Les fichiers images à uploader (max 50MB total)
   * @returns Observable contenant la liste des URLs des images uploadées
   */
  uploadMultipleGalleryImages(structureId: number, files: File[]): Observable<FileUploadResponseDto[]> {
    const endpointContext = `structures/${structureId}/gallery`;

    const url = this.apiConfig.getUrl(endpointContext);
    const formData = new FormData();

    // Ajouter tous les fichiers avec le nom 'files'
    files.forEach(file => {
      formData.append('files', file, file.name);
    });

    const headers = this.apiConfig.createFormDataHeaders();

    this.apiConfig.logApiRequest('POST', endpointContext, `FormData with ${files.length} files`);
    return this.http.post<FileUploadResponseDto[]>(url, formData, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'uploadMultipleGalleryImages'))
    );
  }

  /**
   * Supprime une image de la galerie
   * @param structureId ID de la structure
   * @param imagePath URL de l'image à supprimer
   * @returns Observable vide
   */
  deleteGalleryImage(structureId: number, imagePath: string): Observable<void> {
    const endpointContext = `structures/${structureId}/gallery`;

    // Créer les paramètres de requête avec imagePath
    const httpParams = new HttpParams().set('imagePath', imagePath);

    this.apiConfig.logApiRequest('DELETE', endpointContext, { imagePath });
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.delete<void>(url, {
      headers,
      params: httpParams  // Utiliser params au lieu de body
    }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'Image de galerie supprimée')),
      catchError(error => this.handleStructureError(error, 'deleteGalleryImage'))
    );
  }

  /**
   * Supprime une image de la structure (logo ou couverture)
   * @param structureId ID de la structure
   * @param type Le type d'image ('logo' ou 'cover')
   * @returns Observable vide
   */
  deleteStructureImage(structureId: number, type: 'logo' | 'cover'): Observable<void> {
    const endpointContext = `structures/${structureId}/${type}`;

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'Image supprimée')),
      catchError(error => this.handleStructureError(error, 'deleteStructureImage'))
    );
  }


  /**
   * Deletes a structure by its ID.
   * @param id - The ID of the structure to delete.
   */
  deleteStructure(id: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.byId(id);
    this.apiConfig.logApiRequest('DELETE', endpointContext);

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'Deletion successful')),
      catchError(error => this.handleStructureError(error, 'deleteStructure'))
    );
  }

  /**
   * Retrieves available structure types.
   * Returns raw API DTOs.
   */
  getStructureTypes(): Observable<any[]> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.types;

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getStructureTypes'))
    );
  }

  /**
   * Retrieves areas for a specific structure.
   * @param structureId - The ID of the structure.
   */
  getStructureAreas(structureId: number): Observable<StructureAreaModel[]> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areas(structureId);

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<any[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getStructureAreas'))
    );
  }

  /**
   * Creates a new area for a structure.
   * @param structureId - The ID of the structure.
   * @param areaDto - The DTO for creating the area.
   */
  createArea(structureId: number, areaDto: any): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areas(structureId);

    this.apiConfig.logApiRequest('POST', endpointContext, areaDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<any>(url, areaDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'createArea'))
    );
  }

  /**
   * Updates an existing area.
   * @param structureId - The ID of the structure.
   * @param areaId - The ID of the area to update.
   * @param areaDto - Partial DTO with fields to update.
   */
  updateArea(structureId: number, areaId: number, areaDto: any): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId);

    this.apiConfig.logApiRequest('PATCH', endpointContext, areaDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.patch<any>(url, areaDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PATCH', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'updateArea'))
    );
  }

  /**
   * Deletes an area.
   * @param structureId - The ID of the structure.
   * @param areaId - The ID of the area to delete.
   */
  deleteArea(structureId: number, areaId: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId);

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.delete<void>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('DELETE', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'deleteArea'))
    );
  }

  /**
   * Creates a new audience zone template for an area.
   * @param structureId - The ID of the structure.
   * @param areaId - The ID of the area.
   * @param templateDto - The DTO for creating the template.
   */
  createAudienceZoneTemplate(structureId: number, areaId: number, templateDto: any): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areaAudienceZoneTemplates(structureId, areaId);

    this.apiConfig.logApiRequest('POST', endpointContext, templateDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<any>(url, templateDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'createAudienceZoneTemplate'))
    );
  }

  /**
   * Updates an existing audience zone template.
   * @param structureId - The ID of the structure.
   * @param areaId - The ID of the area.
   * @param templateId - The ID of the template to update.
   * @param templateDto - Partial DTO with fields to update.
   */
  updateAudienceZoneTemplate(structureId: number, areaId: number, templateId: number, templateDto: any): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areaAudienceZoneTemplateById(structureId, areaId, templateId);

    this.apiConfig.logApiRequest('PATCH', endpointContext, templateDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.patch<any>(url, templateDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PATCH', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'updateAudienceZoneTemplate'))
    );
  }

  /**
   * Deletes an audience zone template.
   * @param structureId - The ID of the structure.
   * @param areaId - The ID of the area.
   * @param templateId - The ID of the template to delete.
   */
  deleteAudienceZoneTemplate(structureId: number, areaId: number, templateId: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areaAudienceZoneTemplateById(structureId, areaId, templateId);

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.delete<void>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('DELETE', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'deleteAudienceZoneTemplate'))
    );
  }

  /**
   * Handles errors from structure API calls.
   * Uses the centralized ErrorHandlingService to provide consistent error handling.
   * @param error - The HttpErrorResponse.
   * @param context - A string describing the context of the error.
   */
  private handleStructureError(error: HttpErrorResponse, context: string): Observable<never> {
    // Déterminer le message d'erreur en fonction du statut
    let userMessage: string;

    if (error.status === 404) {
      userMessage = 'Structure ou ressource associée non trouvée.';
    } else if (error.status === 403) {
      userMessage = 'Accès refusé pour cette action sur les structures.';
    } else if (error.status === 400) {
      userMessage = 'Données de structure invalides.';
    } else if (error.status === 409) {
      userMessage = error.error?.message || 'Un conflit est survenu (ex: nom déjà utilisé).';
    } else {
      // Si aucun cas spécifique n'est trouvé, utiliser le message par défaut du service
      return this.errorHandler.handleHttpError(error, `structure-${context}`);
    }

    // Utiliser le service d'erreur avec le message personnalisé
    return this.errorHandler.handleGeneralError(userMessage, error, `structure-${context}`);
  }
}
