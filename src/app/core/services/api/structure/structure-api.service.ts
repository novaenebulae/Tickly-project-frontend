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
    this.apiConfig.logApiRequest('GET', endpointContext, params);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetStructures(params);
    }

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
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetStructureById(id);
    }

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
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetStructureTypes();
    }

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
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockGetAreas(structureId);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'getAreas'))
    );
  }

  /**
   * Creates a new physical area within a structure.
   * @param structureId - The ID of the structure.
   * @param areaApiDto - DTO for creating the area (raw API format).
   */
  createArea(structureId: number, areaApiDto: any): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areas(structureId);
    this.apiConfig.logApiRequest('POST', endpointContext, areaApiDto);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockCreateArea(structureId, areaApiDto);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<any>(url, areaApiDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'createArea'))
    );
  }

  /**
   * Updates an existing physical area within a structure.
   * @param structureId - The ID of the structure.
   * @param areaId - The ID of the area to update.
   * @param areaApiDto - Partial DTO with fields to update (raw API format).
   */
  updateArea(structureId: number, areaId: number, areaApiDto: Partial<any>): Observable<any> {
    const endpointContext = APP_CONFIG.api.endpoints.structures.areaById(structureId, areaId);
    this.apiConfig.logApiRequest('PUT', endpointContext, areaApiDto);

    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockService.mockUpdateArea(structureId, areaId, areaApiDto);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.put<any>(url, areaApiDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', endpointContext, response)),
      catchError(error => this.handleStructureError(error, 'updateArea'))
    );
  }

  /**
   * Deletes a physical area from a structure.
   * @param structureId - The ID of the structure.
   * @param areaId - The ID of the area to delete.
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
      tap(() => this.apiConfig.logApiResponse('DELETE', endpointContext, 'Deletion successful')),
      catchError(error => this.handleStructureError(error, 'deleteArea'))
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
