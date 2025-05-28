/**
 * @file Provides mock implementations for the Structure API service methods.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs'; // Removed 'of' as createMockResponse returns Observable

import { ApiConfigService } from '../api-config.service';
import { StructureCreationResponseDto } from '../../../models/structure/structure.model'; // Using DTO
import { StructureTypeModel } from '../../../models/structure/structure-type.model';
import { StructureSearchParams } from '../../../models/structure/structure-search-params.model';
import { StructureAreaModel } from '../../../models/structure/structure-area.model';

// Import des données de mock
import { mockStructureTypes } from '../../../mocks/structures/structure-types.mock';
import { mockAreas } from '../../../mocks/structures/areas.mock';
import { mockStructures } from '../../../mocks/structures/data/mockStructuresData'; // Ensure this mock data includes importance and eventsCount

@Injectable({
  providedIn: 'root'
})
export class StructureApiMockService {
  private apiConfig = inject(ApiConfigService);

  // In-memory store for mocks to reflect changes
  private currentMockStructures: any[] = JSON.parse(JSON.stringify(mockStructures));
  private currentMockAreas: StructureAreaModel[] = JSON.parse(JSON.stringify(mockAreas));

  mockGetStructures(params: StructureSearchParams): Observable<any[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'structures', params);
    let filteredStructures = [...this.currentMockStructures];

    if (params.query) {
      const query = params.query.toLowerCase();
      filteredStructures = filteredStructures.filter(s =>
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
      );
    }
    if (params.typeIds && params.typeIds.length > 0) {
      filteredStructures = filteredStructures.filter(s =>
        s.types && s.types.some((t: StructureTypeModel) => params.typeIds!.includes(t.id))
      );
    }
    if (params.location) {
      const location = params.location.toLowerCase();
      filteredStructures = filteredStructures.filter(s =>
        s.address.city.toLowerCase().includes(location) ||
        s.address.country.toLowerCase().includes(location) ||
        (s.address.zipCode && s.address.zipCode.toLowerCase().includes(location))
      );
    }
    if (params.sortBy) {
      const direction = params.sortDirection === 'desc' ? -1 : 1;
      filteredStructures.sort((a: any, b: any) => {
        if (a[params.sortBy!] < b[params.sortBy!]) return -1 * direction;
        if (a[params.sortBy!] > b[params.sortBy!]) return 1 * direction;
        return 0;
      });
    }
    if (params.page !== undefined && params.pageSize !== undefined) {
      const start = params.page * params.pageSize;
      filteredStructures = filteredStructures.slice(start, start + params.pageSize);
    }
    // All structures returned by mock should include importance and eventsCount
    // This is assumed to be part of the objects in this.currentMockStructures
    return this.apiConfig.createMockResponse(filteredStructures);
  }

  mockGetStructureById(id: number): Observable<any | undefined> {
    this.apiConfig.logApiRequest('MOCK GET', `structures/byId(${id})`, null); // Using byId for context
    const structure = this.currentMockStructures.find(s => s.id === id);
    if (!structure) {
      return this.apiConfig.createMockError(404, 'Mock Structure not found');
    }
    // Ensure structure includes importance and eventsCount
    return this.apiConfig.createMockResponse(structure);
  }

  mockCreateStructure(structureApiDto: any): Observable<StructureCreationResponseDto> {
    this.apiConfig.logApiRequest('MOCK POST', 'structures/create', structureApiDto); // Using create endpoint
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
      eventsCount: 0, // Default for new structure
      importance: Math.floor(Math.random() * 5) + 1, // Random importance for mock
      areas: []
    };
    this.currentMockStructures.push(newApiStructureDto);

    const response: StructureCreationResponseDto = {
      newToken: `mock_jwt_token_for_structure_creation_${Date.now()}`,
      createdStructure: newApiStructureDto
    };
    return this.apiConfig.createMockResponse(response);
  }

  mockUpdateStructure(id: number, structureApiDto: Partial<any>): Observable<any | undefined> {
    this.apiConfig.logApiRequest('MOCK PUT', `structures/byId(${id})`, structureApiDto); // Using byId for context
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
      updatedStructureDto.types = mockStructureTypes.filter(t => structureApiDto['typeIds'].includes(t.id));
    }
    // 'importance' and 'eventsCount' are typically read-only or updated by backend logic,
    // but if frontend can send them for update, the mock would reflect that.
    // For now, assuming they are not part of the update DTO from client.
    this.currentMockStructures[index] = updatedStructureDto;
    return this.apiConfig.createMockResponse(updatedStructureDto);
  }

  mockDeleteStructure(id: number): Observable<void> {
    this.apiConfig.logApiRequest('MOCK DELETE', `structures/byId(${id})`, null); // Using byId for context
    const index = this.currentMockStructures.findIndex(s => s.id === id);
    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Mock Structure not found for deletion');
    }
    this.currentMockStructures.splice(index, 1);
    return this.apiConfig.createMockResponse(undefined as void);
  }

  mockGetStructureTypes(): Observable<any[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'structures/types', null);
    return this.apiConfig.createMockResponse(mockStructureTypes);
  }

  mockGetAreas(structureId: number): Observable<any[]> {
    const endpointContext = `structures/areas(${structureId})`; // For logging
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, null);
    const structureExists = this.currentMockStructures.some(s => s.id === structureId);
    if (!structureExists) {
      return this.apiConfig.createMockError(404, `Mock Structure with id ${structureId} not found`);
    }
    const areas = this.currentMockAreas.filter(a => a.structureId === structureId);
    return this.apiConfig.createMockResponse(areas);
  }

  mockCreateArea(structureId: number, areaApiDto: any): Observable<any> {
    const endpointContext = `structures/areas(${structureId})`; // For logging
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

  mockUpdateArea(structureId: number, areaId: number, areaApiDto: Partial<any>): Observable<any | undefined> {
    const endpointContext = `structures/areaById(${structureId}, ${areaId})`; // For logging
    this.apiConfig.logApiRequest('MOCK PUT', endpointContext, areaApiDto);
    const index = this.currentMockAreas.findIndex(a => a.id === areaId && a.structureId === structureId);
    if (index === -1) {
      return this.apiConfig.createMockError(404, `Mock Area with id ${areaId} not found in structure ${structureId}`);
    }
    const updatedAreaDto = { ...this.currentMockAreas[index], ...areaApiDto };
    this.currentMockAreas[index] = updatedAreaDto;
    return this.apiConfig.createMockResponse(updatedAreaDto);
  }

  mockDeleteArea(structureId: number, areaId: number): Observable<void> {
    const endpointContext = `structures/areaById(${structureId}, ${areaId})`; // For logging
    this.apiConfig.logApiRequest('MOCK DELETE', endpointContext, null);
    const index = this.currentMockAreas.findIndex(a => a.id === areaId && a.structureId === structureId);
    if (index === -1) {
      return this.apiConfig.createMockError(404, `Mock Area with id ${areaId} not found in structure ${structureId} for deletion`);
    }
    this.currentMockAreas.splice(index, 1);
    return this.apiConfig.createMockResponse(undefined as void);
  }
}
