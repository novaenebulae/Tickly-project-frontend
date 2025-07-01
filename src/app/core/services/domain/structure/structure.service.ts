/**
 * @file Domain service for managing structures (venues) and their related data (types, areas).
 * This service encapsulates business logic, composes StructureApiService for API interactions,
 * and manages state/cache for structures.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {Injectable, inject, signal, computed, WritableSignal} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, tap, catchError, switchMap} from 'rxjs/operators';

// API Service
import {StructureApiService} from '../../api/structure/structure-api.service';

// Models and DTOs
import {
  StructureModel,
  StructureCreationDto,
  StructureUpdateDto,
  StructureCreationResponseDto
} from '../../../models/structure/structure.model';
import {StructureTypeModel} from '../../../models/structure/structure-type.model';
import {StructureAddressModel} from '../../../models/structure/structure-address.model';
import {StructureSearchParams} from '../../../models/structure/structure-search-params.model';

// Other Domain Services
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';
import {ApiConfigService} from '../../api/api-config.service';
import {Router} from '@angular/router';
import {StructureSummaryModel} from '../../../models/structure/structure-summary.model';
import {FileUploadResponseDto} from '../../../models/files/file-upload-response.model';

import {UserStructureService} from '../user-structure/user-structure.service';
import {AudienceZoneTemplateModel} from '../../../models/structure/AudienceZoneTemplate.model';
import {StructureAreaModel} from '../../../models/structure/structure-area.model';
import {EventAudienceZone} from '../../../models/event/event-audience-zone.model';

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private structureApi = inject(StructureApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiConfig = inject(ApiConfigService);

  // We don't inject UserStructureService directly to avoid circular dependency
  // Instead, we'll use a method to get it when needed
  // NOTE: This approach might cause issues if the services are initialized in the wrong order.
  // A better approach for the future would be to extract the shared functionality into a separate service
  // that both StructureService and UserStructureService can depend on.

  // --- State Management using Signals ---

  // Cache for structure types
  private structureTypesSig: WritableSignal<StructureTypeModel[]> = signal([]);
  public readonly structureTypes = computed(() => this.structureTypesSig());

  // Signal for the currently selected or managed structure's full details
  private currentStructureDetailsSig: WritableSignal<StructureModel | null | undefined> = signal(undefined); // undefined: loading, null: not found
  public readonly currentStructureDetails = computed(() => this.currentStructureDetailsSig());

  constructor() {
    // Preload structure types on service initialization
    this.loadStructureTypes().subscribe();
  }

  // --- Structure CRUD Operations ---
  /**
   * Retrieves a list of structures based on search parameters.
   * Transforms raw API DTOs into `StructureModel[]`.
   * Handles local sorting by 'importance' if API doesn't support it directly and params request it.
   * @param params - Search parameters for filtering and sorting.
   * @returns An Observable of `StructureModel[]`.
   */
  getStructures(params: StructureSearchParams = {}): Observable<StructureSummaryModel[]> {
    // `importance` and `eventsCount` are assumed to be included by default by the backend.
    // No need for includeImportanceStats or includeEventCount parameters here.
    return this.structureApi.getStructures(params).pipe(
      catchError(error => {
        this.handleError('Impossible de récupérer la liste des structures.', error);
        return of([]); // Return empty array on error
      })
    );
  }

  /**
   * Retrieves a single structure by its ID.
   * Sets the fetched structure as the `currentStructureDetailsSig`.
   * @param structureId - The ID of the structure to retrieve.
   * @param forceRefresh - If true, fetches from the API even if the ID matches the current cached structure.
   * @returns An Observable of `StructureModel` or `undefined` if not found/error.
   */
  getStructureById(structureId: number, forceRefresh = false): Observable<StructureModel | undefined> {
    const current = this.currentStructureDetailsSig();
    if (!forceRefresh && current?.id === structureId) {
      return of(current);
    }
    this.currentStructureDetailsSig.set(undefined); // Indicate loading

    return this.structureApi.getStructureById(structureId).pipe(
      map(apiStructure => apiStructure ? this.mapApiToStructureModel(apiStructure) : undefined),
      tap(structure => {
        this.currentStructureDetailsSig.set(structure || null); // Set to null if not found by API
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer la structure #${structureId}.`, error);
        this.currentStructureDetailsSig.set(null);
        return of(undefined);
      })
    );
  }

  // --- Structure Type Operations ---

  /**
   * Retrieves all available structure types.
   * Uses cache if available, otherwise loads from API.
   * @param forceRefresh - If true, fetches from API even if cached.
   * @returns An Observable of `StructureTypeModel[]`.
   */
  getStructureTypes(forceRefresh = false): Observable<StructureTypeModel[]> {
    if (!forceRefresh && this.structureTypesSig().length > 0) {
      return of(this.structureTypesSig());
    }
    return this.loadStructureTypes();
  }

  /**
   * Loads structure types from the API and updates the cache.
   * @returns An Observable of `StructureTypeModel[]`.
   */
  private loadStructureTypes(): Observable<StructureTypeModel[]> {
    return this.structureApi.getStructureTypes().pipe(
      map((apiTypes: any[]): StructureTypeModel[] =>
        apiTypes.map(t => this.mapApiToStructureTypeModel(t)) // Assuming API DTO matches StructureTypeModel
      ),
      tap(types => {
        this.structureTypesSig.set(types);
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer les types de structures.', error);
        this.structureTypesSig.set([]); // Clear cache on error
        return of([]);
      })
    );
  }

  // --- Utility Methods ---

  /**
   * Retrieves the count of events for a given structure.
   * @param structure - The `StructureModel` object.
   * @returns The number of events, or 0 if not defined.
   */
  getEventCountForStructure(structure: StructureModel): number {
    return structure?.eventsCount ?? 0;
  }

  // --- Data Mapping Utilities (if API DTOs differ from StructureModel) ---
  // Assuming API DTOs mostly match our models. If not, expand these mappers.
  public mapApiToStructureModel(apiStructure: any): StructureModel {
    // Perform transformations if apiStructure is not identical to StructureModel
    // For example, date string to Date objects.

    return {
      ...apiStructure,
      types: (apiStructure.types || []).map((t: any) => this.mapApiToStructureTypeModel(t)),
      // Use UserStructureService's mapping method for areas
      areas: (apiStructure.areas || []).map((a: any) => this.mapApiToAreaModel(a)),
      createdAt: new Date(apiStructure.createdAt), // Ensure dates are Date objects
      updatedAt: apiStructure.updatedAt ? new Date(apiStructure.updatedAt) : undefined,
    } as StructureModel;
  }

  /**
   * Maps a raw API DTO to a `StructureSummaryModel`.
   * @param dto - The raw data object from the API.
   * @returns A `StructureSummaryModel` instance.
   */
  public mapApiToStructureSummaryModel(dto: any): StructureSummaryModel {
    return {
      id: dto.id,
      name: dto.name,
      types: dto.types || [],
      city: dto.address?.city || 'Ville non disponible',
      logoUrl: dto.logoUrl,
      coverUrl: dto.coverUrl,
      isActive: dto.isActive !== undefined ? dto.isActive : true, // Par défaut à true si non fourni
      eventCount: dto.eventsCount || 0,
    };
  }

  /**
   * Maps API area data to StructureAreaModel
   */
  public mapApiToAreaModel(apiArea: any): StructureAreaModel {
    return {
      id: apiArea.id,
      name: apiArea.name,
      maxCapacity: apiArea.maxCapacity,
      active: apiArea.active,
      description: apiArea.description,
      structureId: apiArea.structureId,
      audienceZoneTemplates: apiArea.audienceZoneTemplates?.map((template: any) =>
        this.mapApiToAudienceZoneTemplateModel(template)
      )
    };
  }

  /**
   * Maps API template data to AudienceZoneTemplateModel
   */
  public mapApiToAudienceZoneTemplateModel(apiTemplate: any): AudienceZoneTemplateModel {
    return {
      id: apiTemplate.id,
      name: apiTemplate.name,
      maxCapacity: apiTemplate.maxCapacity,
      seatingType: apiTemplate.seatingType,
      areaId: apiTemplate.areaId,
      active: apiTemplate.active
    };
  }

  /**
   * Maps API zone data to EventAudienceZone
   */
  public mapApiToAudienceZoneModel(apiZone: any): EventAudienceZone {
    return {
      id: apiZone.id,
      name: apiZone.name,
      areaId: apiZone.areaId,
      maxCapacity: apiZone.maxCapacity,
      isActive: apiZone.isActive,
      seatingType: apiZone.seatingType,
    };
  }


  public mapApiToStructureTypeModel(apiType: any): StructureTypeModel {
    return apiType as StructureTypeModel; // Direct cast if API DTO matches
  }

  /**
   * Centralized error handler for structure-related operations.
   * Logs the error and displays a notification.
   * @param message - The user-facing message to display.
   * @param error - The error object from the API call.
   */
  private handleError(message: string, error: any): void {
    // The error object from StructureApiService already contains a user-friendly 'message'
    console.error(`StructureService Error: ${message}`, error.originalError || error);
    this.notification.displayNotification(
      error.message || message, // Use error.message if provided by handleStructureError
      'error'
    );
  }

  /**
   * Gets the UserStructureService instance.
   * This is used to avoid circular dependency issues.
   * @returns The UserStructureService instance.
   */
  private getUserStructureService(): UserStructureService {
    // Using inject function with the current injector to get the service
    return inject(UserStructureService);
  }
}
