/**
 * @file API service for structure-related operations.
 * Handles HTTP requests for structures and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http'; // HttpParams might not be needed if no query params for some methods
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import { StructureApiMockService } from './structure-api-mock.service';
import { APP_CONFIG } from '../../../config/app-config'; // Adjusted path assuming config is one level up from core

// DTOs for API interaction
import { StructureCreationResponseDto } from '../../../models/structure/structure.model'; // Assuming structure.model.ts has DTOs
import { StructureSearchParams } from '../../../models/structure/structure-search-params.model';

@Injectable({
  providedIn: 'root'
})
export class StructureApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private mockService = inject(StructureApiMockService);

  /**
   * Retrieves structures based on search parameters.
   * Backend is expected to include 'importance' and 'eventsCount' by default.
   * Returns raw API DTOs.
   * @param params - Search parameters.
   */
  getStructures(params: StructureSearchParams = {}): Observable<any[]> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.base;

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetStructures(params);
    }

    this.apiConfig.logApiRequest('GET', endpointContext, params);
    const httpParams = this.apiConfig.createHttpParams(params); // createHttpParams handles undefined/null values
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

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetStructureById(id);
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    // No specific query params needed here if stats are included by default

    return this.http.get<any>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getStructureById'))
    );
  }

  /**
   * Creates a new structure.
   * @param structureApiDto - The DTO for creating the structure (raw API format).
   */
  createStructure(structureApiDto: any): Observable<StructureCreationResponseDto> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.base; // Using base create endpoint
    this.apiConfig.logApiRequest('POST', endpointContext, structureApiDto);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockCreateStructure(structureApiDto);
    }

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
    this.apiConfig.logApiRequest('PUT', endpointContext, structureApiDto);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockUpdateStructure(id, structureApiDto);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.put<any>(url, structureApiDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'updateStructure'))
    );
  }

  /**
   * Deletes a structure by its ID.
   * @param id - The ID of the structure to delete.
   */
  deleteStructure(id: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.byId(id);
    this.apiConfig.logApiRequest('DELETE', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockDeleteStructure(id);
    }

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

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetStructureTypes();
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getStructureTypes'))
    );
  }

  /**
   * Retrieves physical areas for a given structure.
   * Returns raw API DTOs.
   * @param structureId - The ID of the structure.
   */
  getAreas(structureId: number): Observable<any[]> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areas(structureId);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetAreas(structureId);
    }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getAreas'))
    );
  }

// Ajouter ces méthodes au StructureApiService existant

  /**
   * Crée une nouvelle area pour une structure
   */
  createArea(structureId: number, areaData: any): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areas(structureId);
    this.apiConfig.logApiRequest('POST', endpointContext, areaData);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockCreateArea(structureId, areaData);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<any>(url, areaData, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'createArea'))
    );
  }

  /**
   * Met à jour une area existante
   */
  updateArea(structureId: number, areaId: number, areaData: any): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId);
    this.apiConfig.logApiRequest('PUT', endpointContext, areaData);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockUpdateArea(structureId, areaId, areaData);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.put<any>(url, areaData, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'updateArea'))
    );
  }

  /**
   * Supprime une area
   */
  deleteArea(structureId: number, areaId: number): Observable<void> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId);
    this.apiConfig.logApiRequest('DELETE', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockDeleteArea(structureId, areaId);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'Area deleted')),
      catchError(error => this.handleStructureError(error, 'deleteArea'))
    );
  }


  /**
   * Retrieves audience zones for a specific area
   */
  getAreaAudienceZones(structureId: number, areaId: number): Observable<any[]> {
    const endpointContext = `${APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId)}/audience-zones`;
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetAreaAudienceZones(structureId, areaId);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getAreaAudienceZones'))
    );
  }

  /**
   * Creates a new audience zone for an area
   */
  createAreaAudienceZone(structureId: number, areaId: number, zoneData: any): Observable<any> {
    const endpointContext = `${APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId)}/audience-zones`;
    this.apiConfig.logApiRequest('POST', endpointContext, zoneData);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockCreateAreaAudienceZone(structureId, areaId, zoneData);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<any>(url, zoneData, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'createAreaAudienceZone'))
    );
  }

  /**
   * Updates an existing audience zone
   */
  updateAreaAudienceZone(structureId: number, areaId: number, zoneId: number, zoneData: any): Observable<any> {
    const endpointContext = `${APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId)}/audience-zones/${zoneId}`;
    this.apiConfig.logApiRequest('PUT', endpointContext, zoneData);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockUpdateAreaAudienceZone(structureId, areaId, zoneId, zoneData);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.put<any>(url, zoneData, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'updateAreaAudienceZone'))
    );
  }

  /**
   * Deletes an audience zone
   */
  deleteAreaAudienceZone(structureId: number, areaId: number, zoneId: number): Observable<void> {
    const endpointContext = `${APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId)}/audience-zones/${zoneId}`;
    this.apiConfig.logApiRequest('DELETE', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockDeleteAreaAudienceZone(structureId, areaId, zoneId);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'Audience zone deleted')),
      catchError(error => this.handleStructureError(error, 'deleteAreaAudienceZone'))
    );
  }

  /**
   * Searches for structures (convenience method using getStructures).
   * @param query - The search term.
   */
  searchStructures(query: string): Observable<any[]> {
    return this.getStructures({ query });
  }

  /**
   * Handles errors from structure API calls.
   * @param error - The HttpErrorResponse.
   * @param context - A string describing the context of the error.
   */
  private handleStructureError(error: HttpErrorResponse, context: string): Observable<never> {
    this.apiConfig.logApiError('STRUCTURE-API', context, error);
    let userMessage = 'Une erreur est survenue concernant les structures.'; // Message en français
    if (error.status === 404) {
      userMessage = 'Structure ou ressource associée non trouvée.';
    } else if (error.status === 403) {
      userMessage = 'Accès refusé pour cette action sur les structures.';
    } else if (error.status === 400) {
      userMessage = 'Données de structure invalides.';
    } else if (error.status === 409) {
      userMessage = error.error?.message || 'Un conflit est survenu (ex: nom déjà utilisé).';
    }
    return throwError(() => ({
      status: error.status,
      message: userMessage,
      originalError: error
    }));
  }
}
