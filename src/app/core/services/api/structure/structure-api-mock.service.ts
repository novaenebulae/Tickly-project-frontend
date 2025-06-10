import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { ApiConfigService } from '../api-config.service';
import { StructureCreationResponseDto, StructureModel } from '../../../models/structure/structure.model';
import { StructureTypeModel } from '../../../models/structure/structure-type.model';
import { StructureSearchParams } from '../../../models/structure/structure-search-params.model';
import { StructureAreaModel } from '../../../models/structure/structure-area.model';

// Import des données de mock
import { mockStructureTypes } from '../../../mocks/structures/data/structure-data.mock';
import {getAllMockAudienceZones, mockAreas} from '../../../mocks/structures/data/areas-data.mock';
import { mockStructures } from '../../../mocks/structures/data/structure-data.mock';
import {
  AudienceZoneCreationDto,
  AudienceZoneUpdateDto,
  EventAudienceZone
} from '../../../models/event/event-audience-zone.model';

@Injectable({
  providedIn: 'root'
})
export class StructureApiMockService {
  private apiConfig = inject(ApiConfigService);

  // Clés pour le stockage localStorage
  private readonly MOCK_STRUCTURES_STORAGE_KEY = 'structures';
  private readonly MOCK_AREAS_STORAGE_KEY = 'structure_areas';
  private readonly MOCK_AUDIENCE_ZONES_STORAGE_KEY = 'audience_zones';

  // In-memory store for mocks to reflect changes
  private currentMockStructures: any[] = [];
  private currentMockAreas: StructureAreaModel[] = [];
  private currentMockAudienceZones: EventAudienceZone[] = [];

  constructor() {
    // Initialiser les données depuis localStorage ou données par défaut
    this.initializeMockData();
  }

  /**
   * Initialise toutes les données mock depuis localStorage.
   */
  private initializeMockData(): void {
    this.initializeMockStructures();
    this.initializeMockAreas();
    this.initializeMockAudienceZones();
  }

  /**
   * Initialise les structures mock depuis localStorage ou utilise les données par défaut.
   */
  private initializeMockStructures(): void {
    const storedStructures = this.apiConfig.loadMockDataFromStorage(
      this.MOCK_STRUCTURES_STORAGE_KEY,
      mockStructures
    );
    this.currentMockStructures = [...storedStructures];

    // Synchroniser avec le tableau global si nécessaire
    mockStructures.length = 0;
    mockStructures.push(...this.currentMockStructures);
  }

  /**
   * Initialise les areas mock depuis localStorage ou utilise les données par défaut.
   */
  private initializeMockAreas(): void {
    const storedAreas = this.apiConfig.loadMockDataFromStorage(
      this.MOCK_AREAS_STORAGE_KEY,
      mockAreas
    );
    this.currentMockAreas = [...storedAreas];

    // Synchroniser avec le tableau global si nécessaire
    mockAreas.length = 0;
    mockAreas.push(...this.currentMockAreas);
  }

  /**
   * Initialise les audience zones mock depuis localStorage ou utilise les données par défaut.
   */
  private initializeMockAudienceZones(): void {
    const defaultZones = getAllMockAudienceZones();
    const storedZones = this.apiConfig.loadMockDataFromStorage(
      this.MOCK_AUDIENCE_ZONES_STORAGE_KEY,
      defaultZones
    );
    this.currentMockAudienceZones = [...storedZones];
  }

  /**
   * Sauvegarde les structures dans localStorage.
   */
  private saveMockStructures(): void {
    this.apiConfig.saveMockDataToStorage(this.MOCK_STRUCTURES_STORAGE_KEY, this.currentMockStructures);

    // Synchroniser avec le tableau global
    mockStructures.length = 0;
    mockStructures.push(...this.currentMockStructures);
  }

  /**
   * Sauvegarde les areas dans localStorage.
   */
  private saveMockAreas(): void {
    this.apiConfig.saveMockDataToStorage(this.MOCK_AREAS_STORAGE_KEY, this.currentMockAreas);

    // Synchroniser avec le tableau global
    mockAreas.length = 0;
    mockAreas.push(...this.currentMockAreas);
  }

  /**
   * Sauvegarde les audience zones dans localStorage.
   */
  private saveMockAudienceZones(): void {
    this.apiConfig.saveMockDataToStorage(this.MOCK_AUDIENCE_ZONES_STORAGE_KEY, this.currentMockAudienceZones);
  }

  /**
   * Crée des zones par défaut pour une nouvelle structure
   */
  private createDefaultAreasForStructure(structureId: number): void {
    // Créer quelques areas par défaut pour la nouvelle structure
    const defaultAreas: StructureAreaModel[] = [
      {
        id: Math.max(0, ...this.currentMockAreas.map(a => a.id || 0)) + 1,
        structureId: structureId,
        name: 'Salle Principale',
        maxCapacity: 500,
        description: 'Espace principal de la structure',
        isActive: true
      },
      {
        id: Math.max(0, ...this.currentMockAreas.map(a => a.id || 0)) + 2,
        structureId: structureId,
        name: 'Scène Secondaire',
        maxCapacity: 200,
        description: 'Scène annexe pour événements plus intimistes',
        isActive: true
      }
    ];

    // Ajouter les areas à la liste et sauvegarder
    this.currentMockAreas.push(...defaultAreas);
    this.saveMockAreas();

    console.log(`${defaultAreas.length} default areas created for structure ${structureId}`);
  }

  /**
   * Mock implementation for retrieving a structure by ID
   * @param id - Structure ID
   * @returns Observable of structure object
   */
  mockGetStructureById(id: number): Observable<any> {
    this.apiConfig.logApiRequest('MOCK GET', `structures/byId(${id})`, null);

    const structure = this.currentMockStructures.find(s => s.id === id);
    if (!structure) {
      return this.apiConfig.createMockError(404, `Mock: Structure with id ${id} not found`);
    }

    // Récupérer les areas associées à cette structure
    const structureWithAreas = {
      ...structure,
      areas: this.currentMockAreas.filter(a => a.structureId === id)
    };

    return this.apiConfig.createMockResponse(structureWithAreas);
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

    // Ajouter la nouvelle structure et sauvegarder
    this.currentMockStructures.push(newApiStructureDto);
    this.saveMockStructures();

    // Ajouter un ensemble de zones d'audience par défaut pour cette structure
    this.createDefaultAreasForStructure(newId);

    console.log(`Mock structure ${newId} created and saved to localStorage`);

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
    this.saveMockStructures();
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
    this.saveMockStructures();
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
    this.saveMockAreas();
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
    this.saveMockAreas();
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
    this.saveMockAreas();
    return this.apiConfig.createMockResponse(undefined as void);
  }

  /**
   * Mock implementation for retrieving audience zones for a specific area
   */
  mockGetAreaAudienceZones(structureId: number, areaId: number): Observable<EventAudienceZone[]> {
    this.apiConfig.logApiRequest('MOCK GET', `structures/${structureId}/areas/${areaId}/audience-zones`, null);

    const zonesForArea = this.currentMockAudienceZones.filter(zone => zone.areaId === areaId);
    return this.apiConfig.createMockResponse(zonesForArea);
  }

  /**
   * Mock implementation for creating a new audience zone for an area
   */
  mockCreateAreaAudienceZone(structureId: number, areaId: number, zoneData: AudienceZoneCreationDto): Observable<EventAudienceZone> {
    this.apiConfig.logApiRequest('MOCK POST', `structures/${structureId}/areas/${areaId}/audience-zones`, zoneData);

    if (!zoneData.name || !zoneData.maxCapacity || zoneData.maxCapacity < 1) {
      return this.apiConfig.createMockError(400, 'Mock: Name and valid maxCapacity are required for audience zone creation');
    }

    const newId = Math.max(0, ...this.currentMockAudienceZones.map(z => z.id || 0)) + 1;

    const newZone: EventAudienceZone = {
      id: newId,
      name: zoneData.name,
      areaId: areaId,
      maxCapacity: zoneData.maxCapacity,
      isActive: zoneData.isActive,
      seatingType: zoneData.seatingType
    };

    this.currentMockAudienceZones.push(newZone);
    this.saveMockAudienceZones();
    return this.apiConfig.createMockResponse(newZone);
  }

  /**
   * Mock implementation for updating an existing audience zone
   */
  mockUpdateAreaAudienceZone(structureId: number, areaId: number, zoneId: number, zoneData: AudienceZoneUpdateDto): Observable<EventAudienceZone | undefined> {
    this.apiConfig.logApiRequest('MOCK PUT', `structures/${structureId}/areas/${areaId}/audience-zones/${zoneId}`, zoneData);

    const index = this.currentMockAudienceZones.findIndex(z => z.id === zoneId && z.areaId === areaId);
    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Mock Audience Zone not found for update');
    }

    const updatedZone: EventAudienceZone = {
      ...this.currentMockAudienceZones[index],
      ...zoneData
    };

    this.currentMockAudienceZones[index] = updatedZone;
    this.saveMockAudienceZones();
    return this.apiConfig.createMockResponse(updatedZone);
  }

  /**
   * Mock implementation for deleting an audience zone
   */
  mockDeleteAreaAudienceZone(structureId: number, areaId: number, zoneId: number): Observable<void> {
    this.apiConfig.logApiRequest('MOCK DELETE', `structures/${structureId}/areas/${areaId}/audience-zones/${zoneId}`, null);

    const index = this.currentMockAudienceZones.findIndex(z => z.id === zoneId && z.areaId === areaId);
    if (index === -1) {
      return this.apiConfig.createMockError(404, 'Mock Audience Zone not found for deletion');
    }

    this.currentMockAudienceZones.splice(index, 1);
    this.saveMockAudienceZones();
    return this.apiConfig.createMockResponse(undefined);
  }

  /**
   * Mock implementation for retrieving structures based on search parameters
   * @param params - Search parameters
   * @returns Observable of structures array
   */
  mockGetStructures(params: StructureSearchParams = {}): Observable<any[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'structures', params);

    let filteredStructures = [...this.currentMockStructures];

    // Filtrage par query
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredStructures = filteredStructures.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.address?.city?.toLowerCase().includes(query)
      );
    }

    // Tri des résultats
    if (params.sortBy) {
      const sortDirection = params.sortDirection === 'desc' ? -1 : 1;

      filteredStructures.sort((a, b) => {
        if (params.sortBy === 'name') {
          return sortDirection * a.name.localeCompare(b.name);
        } else if (params.sortBy === 'importance') {
          const importanceA = a.importance || 0;
          const importanceB = b.importance || 0;
          return sortDirection * (importanceA - importanceB);
        } else if (params.sortBy === 'eventsCount') {
          const countA = a.eventsCount || 0;
          const countB = b.eventsCount || 0;
          return sortDirection * (countA - countB);
        } else if (params.sortBy === 'createdAt') {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortDirection * (dateA - dateB);
        }
        return 0;
      });
    }

    return this.apiConfig.createMockResponse(filteredStructures);
  }
}
