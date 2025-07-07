/**
 * @file Domain service for managing structures (venues) and their related data (types, areas).
 * This service encapsulates business logic, composes StructureApiService for API interactions,
 * and manages state/cache for structures.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

// API Service
import {StructureApiService} from '../../api/structure/structure-api.service';

// Models and DTOs
import {
  StructureCreationDto,
  StructureCreationResponseDto,
  StructureModel
} from '../../../models/structure/structure.model';
import {StructureTypeModel} from '../../../models/structure/structure-type.model';
import {StructureSearchParams} from '../../../models/structure/structure-search-params.model';

// Other Domain Services
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';
import {Router} from '@angular/router';
import {StructureSummaryModel} from '../../../models/structure/structure-summary.model';
import {AudienceZoneTemplateModel} from '../../../models/structure/AudienceZoneTemplate.model';
import {StructureAreaModel} from '../../../models/structure/structure-area.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private structureApi = inject(StructureApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

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

  constructor() {
    // Preload structure types on service initialization
    this.loadStructureTypes()
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  // --- Structure CRUD Operations ---
  /**
   * Creates a new structure.
   * This is used as part of the structure administrator registration flow.
   * @param structureData - The data for the new structure.
   * @returns An Observable of the creation response.
   */
  createStructure(structureData: StructureCreationDto): Observable<StructureCreationResponseDto> {
    return this.structureApi.createStructure(structureData).pipe(
      tap(response => {
        this.notification.displayNotification(
          `Structure créée avec succès.`,
          'valid'
        );

        // If the response indicates we need to re-authenticate to get a new token with structureId
        if (response.accessToken) {
          console.log('Refreshing token after structure creation...');
          // Refresh the token to get a new one with the structureId
          try {
            this.authService.updateTokenAndState(response.accessToken);

            this.notification.displayNotification(
              'Session mise à jour avec les informations de structure.',
              'info'
            );
            // Navigate to the dashboard or another appropriate page
            this.router.navigate(['/admin/dashboard']);
          } catch (error) {
            console.error('Error refreshing token after structure creation:');
            this.notification.displayNotification(
              'Erreur lors de la mise à jour de la session. Veuillez vous reconnecter.',
              'error'
            );
            this.router.navigate(['/auth/login']);
          }
        }
      }),
      catchError(error => {
        console.error('Error creating structure:', error);
        this.notification.displayNotification(
          'Erreur lors de la création de la structure.',
          'error'
        );
        return throwError(() => error);
      })

    );
  }

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

}
