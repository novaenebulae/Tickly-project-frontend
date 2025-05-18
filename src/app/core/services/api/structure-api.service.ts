// src/app/core/services/api/structure-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from './api-config.service';
import { APP_CONFIG } from '../../config/app-config';

// Import des modèles
import { StructureModel, StructureCreationDto, StructureCreationResponse } from '../../models';
import { StructureTypeModel } from '../../models';
import { AreaModel } from '../../models';

import { mockStructures} from '../../mocks/structures/structures.mock';
import { mockStructureTypes} from '../../mocks/structures/structure-types.mock';
import { mockAreas} from '../../mocks/structures/areas.mock';

/**
 * Interface pour les paramètres de recherche de structures
 */
export interface StructureSearchParams {
  query?: string;
  typeIds?: number[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Service API pour les structures
 * Gère les requêtes HTTP liées aux structures et délègue à des mocks si nécessaire
 */
@Injectable({
  providedIn: 'root'
})
export class StructureApiService {
  private apiConfig = inject(ApiConfigService);

  /**
   * Récupère toutes les structures avec possibilité de filtrage
   * @param params Paramètres de recherche
   */
  getStructures(params: StructureSearchParams = {}): Observable<StructureModel[]> {
    this.apiConfig.logApiRequest('GET', 'structures', params);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockGetStructures(params);
    }

    // Préparation des paramètres HTTP
    const httpParams = this.apiConfig.createHttpParams(params);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.base);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<StructureModel[]>(url, { headers, params: httpParams }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'structures', response)),
      catchError(error => this.handleStructureError(error, 'getStructures'))
    );
  }

  /**
   * Récupère une structure par son ID
   * @param id ID de la structure
   */
  getStructureById(id: number): Observable<StructureModel> {
    this.apiConfig.logApiRequest('GET', `structure/${id}`, null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockGetStructureById(id);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<StructureModel>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', `structure/${id}`, response)),
      catchError(error => this.handleStructureError(error, 'getStructureById'))
    );
  }

  /**
   * Crée une nouvelle structure
   * @param structureDto Données de la structure à créer
   */
  createStructure(structureDto: StructureCreationDto): Observable<StructureCreationResponse> {
    this.apiConfig.logApiRequest('POST', 'create-structure', structureDto);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockCreateStructure(structureDto);
    }

    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.create);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.post<StructureCreationResponse>(url, structureDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'create-structure', response)),
      catchError(error => this.handleStructureError(error, 'createStructure'))
    );
  }

  /**
   * Met à jour une structure existante
   * @param id ID de la structure
   * @param structureDto Données mises à jour
   */
  updateStructure(id: number, structureDto: Partial<StructureModel>): Observable<StructureModel> {
    this.apiConfig.logApiRequest('PUT', `update-structure/${id}`, structureDto);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockUpdateStructure(id, structureDto);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.put<StructureModel>(url, structureDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', `update-structure/${id}`, response)),
      catchError(error => this.handleStructureError(error, 'updateStructure'))
    );
  }

  /**
   * Supprime une structure
   * @param id ID de la structure à supprimer
   */
  deleteStructure(id: number): Observable<void> {
    this.apiConfig.logApiRequest('DELETE', `delete-structure/${id}`, null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockDeleteStructure(id);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.base)}/${id}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', `delete-structure/${id}`, 'Suppression réussie')),
      catchError(error => this.handleStructureError(error, 'deleteStructure'))
    );
  }

  /**
   * Récupère tous les types de structures disponibles
   */
  getStructureTypes(): Observable<StructureTypeModel[]> {
    this.apiConfig.logApiRequest('GET', 'structure-types', null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockGetStructureTypes();
    }

    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.types);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<StructureTypeModel[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'structure-types', response)),
      catchError(error => this.handleStructureError(error, 'getStructureTypes'))
    );
  }

  /**
   * Récupère toutes les zones d'une structure
   * @param structureId ID de la structure
   */
  getAreas(structureId: number): Observable<AreaModel[]> {
    this.apiConfig.logApiRequest('GET', `structure/${structureId}/areas`, null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockGetAreas(structureId);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.base)}/${structureId}/areas`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.get<AreaModel[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', `structure/${structureId}/areas`, response)),
      catchError(error => this.handleStructureError(error, 'getAreas'))
    );
  }

  /**
   * Crée une nouvelle zone dans une structure
   * @param structureId ID de la structure
   * @param area Données de la zone à créer
   */
  createArea(structureId: number, area: Omit<AreaModel, 'id' | 'structureId'>): Observable<AreaModel> {
    this.apiConfig.logApiRequest('POST', `structure/${structureId}/areas`, area);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockCreateArea(structureId, area);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.base)}/${structureId}/areas`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.post<AreaModel>(url, area, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', `structure/${structureId}/areas`, response)),
      catchError(error => this.handleStructureError(error, 'createArea'))
    );
  }

  /**
   * Met à jour une zone existante
   * @param structureId ID de la structure
   * @param areaId ID de la zone
   * @param area Données mises à jour
   */
  updateArea(structureId: number, areaId: number, area: Partial<AreaModel>): Observable<AreaModel> {
    this.apiConfig.logApiRequest('PUT', `structure/${structureId}/areas/${areaId}`, area);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockUpdateArea(structureId, areaId, area);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.base)}/${structureId}/areas/${areaId}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.put<AreaModel>(url, area, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('PUT', `structure/${structureId}/areas/${areaId}`, response)),
      catchError(error => this.handleStructureError(error, 'updateArea'))
    );
  }

  /**
   * Supprime une zone
   * @param structureId ID de la structure
   * @param areaId ID de la zone
   */
  deleteArea(structureId: number, areaId: number): Observable<void> {
    this.apiConfig.logApiRequest('DELETE', `structure/${structureId}/areas/${areaId}`, null);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('structures')) {
      return this.mockDeleteArea(structureId, areaId);
    }

    const url = `${this.apiConfig.getUrl(APP_CONFIG.api.endpoints.structures.base)}/${structureId}/areas/${areaId}`;
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.delete<void>(url, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('DELETE', `structure/${structureId}/areas/${areaId}`, 'Suppression réussie')),
      catchError(error => this.handleStructureError(error, 'deleteArea'))
    );
  }

  /**
   * Recherche des structures par nom ou autres critères
   * @param query Terme de recherche
   */
  searchStructures(query: string): Observable<StructureModel[]> {
    return this.getStructures({ query });
  }

  /**
   * Gère les erreurs des appels API de structures
   */
  private handleStructureError(
    error: HttpErrorResponse,
    context: string
  ): Observable<never> {
    this.apiConfig.logApiError('STRUCTURE-API', context, error);

    let userMessage: string;

    if (error.status === 404) {
      userMessage = 'Structure ou ressource non trouvée.';
    } else if (error.status === 403) {
      userMessage = 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.';
    } else if (error.status === 400) {
      userMessage = 'Données invalides. Veuillez vérifier votre saisie.';
    } else if (error.status === 409) {
      userMessage = 'Un conflit est survenu. Cette structure existe peut-être déjà.';
    } else {
      userMessage = 'Une erreur est survenue lors de la communication avec le serveur.';
    }

    return throwError(() => ({
      status: error.status,
      message: userMessage,
      original: error
    }));
  }

  // ===== Méthodes de mock pour les tests et le développement =====

  /**
   * Version mock de la récupération des structures
   */
  private mockGetStructures(params: StructureSearchParams): Observable<StructureModel[]> {
    let filteredStructures = [...mockStructures];

    // Filtrage par recherche textuelle
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredStructures = filteredStructures.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    // Filtrage par types
    if (params.typeIds && params.typeIds.length > 0) {
      filteredStructures = filteredStructures.filter(s =>
        s.types.some(t => params.typeIds!.includes(t.id))
      );
    }

    // Tri
    if (params.sortBy) {
      const direction = params.sortDirection === 'desc' ? -1 : 1;
      filteredStructures.sort((a: any, b: any) => {
        if (a[params.sortBy!] < b[params.sortBy!]) return -1 * direction;
        if (a[params.sortBy!] > b[params.sortBy!]) return 1 * direction;
        return 0;
      });
    }

    // Pagination
    if (params.page !== undefined && params.pageSize) {
      const start = params.page * params.pageSize;
      const end = start + params.pageSize;
      filteredStructures = filteredStructures.slice(start, end);
    }

    return this.apiConfig.createMockResponse(filteredStructures);
  }

  /**
   * Version mock de la récupération d'une structure par ID
   */
  private mockGetStructureById(id: number): Observable<StructureModel> {
    const structure = mockStructures.find(s => s.id === id);

    if (!structure) {
      return this.apiConfig.createMockError(404, 'Structure non trouvée');
    }

    return this.apiConfig.createMockResponse(structure);
  }

  /**
   * Version mock de la création d'une structure
   */
  private mockCreateStructure(structureDto: StructureCreationDto): Observable<StructureCreationResponse> {
    // Validation simplifiée
    if (!structureDto.name || !structureDto.typeIds || structureDto.typeIds.length === 0) {
      return this.apiConfig.createMockError(400, 'Nom et type(s) de structure requis');
    }

    // Création d'un nouvel ID
    const newId = Math.max(...mockStructures.map(s => s.id || 0)) + 1;

    // Récupération des types de structure
    const types = mockStructureTypes.filter(t => structureDto.typeIds.includes(t.id));

    const newStructure: StructureModel = {
      id: newId,
      name: structureDto.name,
      types,
      description: structureDto.description,
      address: structureDto.address,
      phone: structureDto.phone,
      email: structureDto.email,
      websiteUrl: structureDto.websiteUrl,
      socialsUrl: structureDto.socialsUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Simuler un nouveau token
    const newToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return this.apiConfig.createMockResponse<StructureCreationResponse>({
      newToken,
      createdStructure: newStructure
    });
  }

  /**
   * Version mock de la mise à jour d'une structure
   */
  private mockUpdateStructure(id: number, structureDto: Partial<StructureModel>): Observable<StructureModel> {
    const index = mockStructures.findIndex(s => s.id === id);

    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Structure non trouvée');
    }

    // Mise à jour fictive
    const updatedStructure: StructureModel = {
      ...mockStructures[index],
      ...structureDto,
      updatedAt: new Date()
    };

    // Dans un vrai mock, on mettrait à jour la liste
    // mockStructures[index] = updatedStructure;

    return this.apiConfig.createMockResponse(updatedStructure);
  }

  /**
   * Version mock de la suppression d'une structure
   */
  private mockDeleteStructure(id: number): Observable<void> {
    const index = mockStructures.findIndex(s => s.id === id);

    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Structure non trouvée');
    }

    // Dans un vrai mock, on supprimerait de la liste
    // mockStructures.splice(index, 1);

    return this.apiConfig.createMockResponse<void>(undefined);
  }

  /**
   * Version mock de la récupération des types de structures
   */
  private mockGetStructureTypes(): Observable<StructureTypeModel[]> {
    return this.apiConfig.createMockResponse(mockStructureTypes);
  }

  /**
   * Version mock de la récupération des zones d'une structure
   */
  private mockGetAreas(structureId: number): Observable<AreaModel[]> {
    // Vérifier si la structure existe
    const structure = mockStructures.find(s => s.id === structureId);

    if (!structure) {
      return this.apiConfig.createMockError(404, 'Structure non trouvée');
    }

    // Filtrer les zones par structure
    const areas = mockAreas.filter(a => a.structureId === structureId);

    return this.apiConfig.createMockResponse(areas);
  }

  /**
   * Version mock de la création d'une zone
   */
  private mockCreateArea(structureId: number, area: Omit<AreaModel, 'id' | 'structureId'>): Observable<AreaModel> {
    // Vérifier si la structure existe
    const structure = mockStructures.find(s => s.id === structureId);

    if (!structure) {
      return this.apiConfig.createMockError(404, 'Structure non trouvée');
    }

    // Validation simplifiée
    if (!area.name || !area.maxCapacity) {
      return this.apiConfig.createMockError(400, 'Nom et capacité maximale requis');
    }

    // Création d'un nouvel ID
    const newId = Math.max(...mockAreas.map(a => a.id || 0)) + 1;

    const newArea: AreaModel = {
      id: newId,
      structureId,
      ...area,
      isActive: area.isActive !== undefined ? area.isActive : true
    };

    // Dans un vrai mock, on ajouterait à la liste
    // mockAreas.push(newArea);

    return this.apiConfig.createMockResponse(newArea);
  }

  /**
   * Version mock de la mise à jour d'une zone
   */
  private mockUpdateArea(structureId: number, areaId: number, area: Partial<AreaModel>): Observable<AreaModel> {
    // Vérifier si la structure existe
    const structure = mockStructures.find(s => s.id === structureId);

    if (!structure) {
      return this.apiConfig.createMockError(404, 'Structure non trouvée');
    }

    // Vérifier si la zone existe
    const index = mockAreas.findIndex(a => a.id === areaId && a.structureId === structureId);

    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Zone non trouvée');
    }

    // Mise à jour fictive
    const updatedArea: AreaModel = {
      ...mockAreas[index],
      ...area
    };

    // Dans un vrai mock, on mettrait à jour la liste
    // mockAreas[index] = updatedArea;

    return this.apiConfig.createMockResponse(updatedArea);
  }

  /**
   * Version mock de la suppression d'une zone
   */
  private mockDeleteArea(structureId: number, areaId: number): Observable<void> {
    // Vérifier si la structure existe
    const structure = mockStructures.find(s => s.id === structureId);

    if (!structure) {
      return this.apiConfig.createMockError(404, 'Structure non trouvée');
    }

    // Vérifier si la zone existe
    const index = mockAreas.findIndex(a => a.id === areaId && a.structureId === structureId);

    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Zone non trouvée');
    }

    // Dans un vrai mock, on supprimerait de la liste
    // mockAreas.splice(index, 1);

    return this.apiConfig.createMockResponse<void>(undefined);
  }
}
