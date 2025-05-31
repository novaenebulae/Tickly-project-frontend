/**
 * @file Provides mock implementations for the Structure API service methods.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiConfigService } from '../api-config.service';
import { StructureCreationResponseDto } from '../../../models/structure/structure.model';
import { StructureTypeModel } from '../../../models/structure/structure-type.model';
import { StructureSearchParams } from '../../../models/structure/structure-search-params.model';
import { StructureAreaModel } from '../../../models/structure/structure-area.model';

// Import des données de mock
import { mockStructureTypes } from '../../../mocks/structures/data/structure-data.mock';
import { mockAreas } from '../../../mocks/structures/data/areas-data.mock';
import { mockStructures } from '../../../mocks/structures/data/structure-data.mock';

@Injectable({
  providedIn: 'root'
})
export class StructureApiMockService {
  private apiConfig = inject(ApiConfigService);

  // In-memory store for mocks to reflect changes
  private currentMockStructures: any[] = JSON.parse(JSON.stringify(mockStructures));
  private currentMockAreas: StructureAreaModel[] = JSON.parse(JSON.stringify(mockAreas));

  /**
   * Mock implementation for retrieving structures with filtering and pagination
   * @param params - Search and filter parameters
   * @returns Observable of filtered structure array
   */
  mockGetStructures(params: StructureSearchParams): Observable<any[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'structures', params);
    let filteredStructures = [...this.currentMockStructures];

    // Filter by query (name or description)
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredStructures = filteredStructures.filter(s =>
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
      );
    }

    // Filter by type IDs
    if (params.typeIds && params.typeIds.length > 0) {
      filteredStructures = filteredStructures.filter(s => {
        // Ensure s.types is an array and contains objects with id property
        if (!s.types || !Array.isArray(s.types)) {
          return false;
        }
        return s.types.some((type: StructureTypeModel) =>
          params.typeIds!.includes(type.id)
        );
      });
    }

    // Filter by location
    if (params.location) {
      const location = params.location.toLowerCase();
      filteredStructures = filteredStructures.filter(s =>
          s.address && (
            s.address.city.toLowerCase().includes(location) ||
            s.address.country.toLowerCase().includes(location) ||
            (s.address.zipCode && s.address.zipCode.toLowerCase().includes(location))
          )
      );
    }

    // Sort results
    if (params.sortBy) {
      const direction = params.sortDirection === 'desc' ? -1 : 1;
      filteredStructures.sort((a: any, b: any) => {
        const valueA = a[params.sortBy!];
        const valueB = b[params.sortBy!];

        if (valueA < valueB) return -1 * direction;
        if (valueA > valueB) return 1 * direction;
        return 0;
      });
    }

    // Apply pagination
    if (params.page !== undefined && params.pageSize !== undefined) {
      const start = params.page * params.pageSize;
      filteredStructures = filteredStructures.slice(start, start + params.pageSize);
    }

    return this.apiConfig.createMockResponse(filteredStructures);
  }

  /**
   * Mock implementation for retrieving a single structure by ID
   * @param id - Structure ID
   * @returns Observable of structure or undefined if not found
   */
  mockGetStructureById(id: number): Observable<any | undefined> {
    this.apiConfig.logApiRequest('MOCK GET', `structures/byId(${id})`, null);
    const structure = this.currentMockStructures.find(s => s.id === id);
    if (!structure) {
      return this.apiConfig.createMockError(404, 'Mock Structure not found');
    }
    return this.apiConfig.createMockResponse(structure);
  }

  /**
   * Mock implementation for creating a new structure
   * @param structureApiDto - Structure creation data
   * @returns Observable of creation response with new token and structure
   */
  mockCreateStructure(structureApiDto: any): Observable<StructureCreationResponseDto> {
    this.apiConfig.logApiRequest('MOCK POST', 'structures/create', structureApiDto);

    if (!structureApiDto.name || !structureApiDto.typeIds || structureApiDto.typeIds.length === 0) {
      return this.apiConfig.createMockError(400, 'Mock: Name and typeIds are required for structure creation');
    }

    const newId = Math.max(0, ...this.currentMockStructures.map(s => s.id || 0)) + 1;
    const typesFromMock = mockStructureTypes.filter(t => structureApiDto.typeIds.includes(t.id));

    const newApiStructureDto: any = {
      id: newId,
      name: structureApiDto.name,
      types: typesFromMock,
      description: structureApiDto.description,
      address: structureApiDto.address,
      phone: structureApiDto.phone,
      email: structureApiDto.email,
      websiteUrl: structureApiDto.websiteUrl,
      socialsUrl: structureApiDto.socialsUrl,
      logoUrl: structureApiDto.logoUrl,
      coverUrl: structureApiDto.coverUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eventsCount: 0,
      importance: Math.floor(Math.random() * 5) + 1,
      areas: []
    };
    this.currentMockStructures.push(newApiStructureDto);

    const response: StructureCreationResponseDto = {
      newToken: `mock_jwt_token_for_structure_creation_${Date.now()}`,
      createdStructure: newApiStructureDto
    };
    return this.apiConfig.createMockResponse(response);
  }

  /**
   * Mock implementation for updating an existing structure
   * @param id - Structure ID
   * @param structureApiDto - Partial structure update data
   * @returns Observable of updated structure or undefined if not found
   */
  mockUpdateStructure(id: number, structureApiDto: Partial<any>): Observable<any | undefined> {
    this.apiConfig.logApiRequest('MOCK PUT', `structures/byId(${id})`, structureApiDto);
    const index = this.currentMockStructures.findIndex(s => s.id === id);
    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Mock Structure not found for update');
    }

    const updatedStructureDto = {
      ...this.currentMockStructures[index],
      ...structureApiDto,
      updatedAt: new Date().toISOString()
    };

    if (structureApiDto['typeIds']) {
      updatedStructureDto.types = mockStructureTypes.filter(t =>
        structureApiDto['typeIds'].includes(t.id)
      );
    }

    this.currentMockStructures[index] = updatedStructureDto;
    return this.apiConfig.createMockResponse(updatedStructureDto);
  }

  /**
   * Mock implementation for deleting a structure
   * @param id - Structure ID
   * @returns Observable of void
   */
  mockDeleteStructure(id: number): Observable<void> {
    this.apiConfig.logApiRequest('MOCK DELETE', `structures/byId(${id})`, null);
    const index = this.currentMockStructures.findIndex(s => s.id === id);
    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Mock Structure not found for deletion');
    }
    this.currentMockStructures.splice(index, 1);
    return this.apiConfig.createMockResponse(undefined as void);
  }

  /**
   * Mock implementation for retrieving all structure types
   * @returns Observable of structure types array
   */
  mockGetStructureTypes(): Observable<StructureTypeModel[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'structures/types', null);
    return this.apiConfig.createMockResponse(mockStructureTypes);
  }

  /**
   * Mock implementation for retrieving areas of a specific structure
   * @param structureId - Structure ID
   * @returns Observable of areas array
   */
  mockGetAreas(structureId: number): Observable<StructureAreaModel[]> {
    const endpointContext = `structures/areas(${structureId})`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, null);

    const structureExists = this.currentMockStructures.some(s => s.id === structureId);
    if (!structureExists) {
      return this.apiConfig.createMockError(404, `Mock Structure with id ${structureId} not found`);
    }

    const areas = this.currentMockAreas.filter(a => a.structureId === structureId);
    return this.apiConfig.createMockResponse(areas);
  }

  /**
   * Mock implementation for creating a new area in a structure
   * @param structureId - Structure ID
   * @param areaApiDto - Area creation data
   * @returns Observable of created area
   */
  mockCreateArea(structureId: number, areaApiDto: any): Observable<StructureAreaModel> {
    const endpointContext = `structures/areas(${structureId})`;
    this.apiConfig.logApiRequest('MOCK POST', endpointContext, areaApiDto);

    const structureExists = this.currentMockStructures.some(s => s.id === structureId);
    if (!structureExists) {
      return this.apiConfig.createMockError(404, `Mock Structure with id ${structureId} not found, cannot create area`);
    }

    if (!areaApiDto.name || areaApiDto.maxCapacity === undefined) {
      return this.apiConfig.createMockError(400, 'Mock: Name and maxCapacity are required for area creation');
    }

    const newId = Math.max(0, ...this.currentMockAreas.map(a => a.id || 0)) + 1;
    const newApiAreaDto: StructureAreaModel = {
      id: newId,
      structureId: structureId,
      name: areaApiDto.name,
      maxCapacity: areaApiDto.maxCapacity,
      description: areaApiDto.description,
      isActive: areaApiDto.isActive !== undefined ? areaApiDto.isActive : true,
    };

    this.currentMockAreas.push(newApiAreaDto);
    return this.apiConfig.createMockResponse(newApiAreaDto);
  }

  /**
   * Mock implementation for updating an existing area
   * @param structureId - Structure ID
   * @param areaId - Area ID
   * @param areaApiDto - Partial area update data
   * @returns Observable of updated area or undefined if not found
   */
  mockUpdateArea(structureId: number, areaId: number, areaApiDto: Partial<any>): Observable<StructureAreaModel | undefined> {
    const endpointContext = `structures/areaById(${structureId}, ${areaId})`;
    this.apiConfig.logApiRequest('MOCK PUT', endpointContext, areaApiDto);

    const index = this.currentMockAreas.findIndex(a => a.id === areaId && a.structureId === structureId);
    if (index === -1) {
      return this.apiConfig.createMockError(404, `Mock Area with id ${areaId} not found in structure ${structureId}`);
    }

    const updatedAreaDto = { ...this.currentMockAreas[index], ...areaApiDto };
    this.currentMockAreas[index] = updatedAreaDto;
    return this.apiConfig.createMockResponse(updatedAreaDto);
  }

  /**
   * Mock implementation for deleting an area
   * @param structureId - Structure ID
   * @param areaId - Area ID
   * @returns Observable of void
   */
  mockDeleteArea(structureId: number, areaId: number): Observable<void> {
    const endpointContext = `structures/areaById(${structureId}, ${areaId})`;
    this.apiConfig.logApiRequest('MOCK DELETE', endpointContext, null);

    const index = this.currentMockAreas.findIndex(a => a.id === areaId && a.structureId === structureId);
    if (index === -1) {
      return this.apiConfig.createMockError(404, `Mock Area with id ${areaId} not found in structure ${structureId} for deletion`);
    }

    this.currentMockAreas.splice(index, 1);
    return this.apiConfig.createMockResponse(undefined as void);
  }
}
