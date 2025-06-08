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
import {StructureAreaModel, AreaCreationDto, AreaUpdateDto} from '../../../models/structure/structure-area.model';
import {StructureAddressModel} from '../../../models/structure/structure-address.model';
import {StructureSearchParams} from '../../../models/structure/structure-search-params.model';

// Other Domain Services
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';
import {
  AudienceZoneCreationDto,
  AudienceZoneUpdateDto,
  EventAudienceZone
} from '../../../models/event/event-audience-zone.model'; // For token updates and user context

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private structureApi = inject(StructureApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);

  // --- State Management using Signals ---

  // Cache for structure types
  private structureTypesSig: WritableSignal<StructureTypeModel[]> = signal([]);
  public readonly structureTypes = computed(() => this.structureTypesSig());

  // Signal for the currently selected or managed structure's full details
  private currentStructureDetailsSig: WritableSignal<StructureModel | null | undefined> = signal(undefined); // undefined: loading, null: not found
  public readonly currentStructureDetails = computed(() => this.currentStructureDetailsSig());

  // Cache for the areas of the currently selected/managed structure
  private currentStructureAreasSig: WritableSignal<StructureAreaModel[]> = signal([]);
  public readonly currentStructureAreas = computed(() => this.currentStructureAreasSig());

  private currentAreaAudienceZonesSig: WritableSignal<EventAudienceZone[]> = signal([]);
  public readonly currentAreaAudienceZones = computed(() => this.currentAreaAudienceZonesSig());

  private currentStructureAudienceZonesSig: WritableSignal<EventAudienceZone[]> = signal([]);
  public readonly currentStructureAudienceZones = computed(() => this.currentStructureAudienceZonesSig());

  constructor() {
    // Preload structure types on service initialization
    this.loadStructureTypes().subscribe();
  }

  // --- Structure CRUD Operations ---

  /**
   * Creates a new structure.
   * Updates the authentication token if a new one is provided in the response.
   * Sets the newly created structure as the current structure if applicable.
   * @param structureCreationData - The DTO for creating the structure.
   * @returns An Observable of the created `StructureModel` or `undefined` on error.
   */
  createStructure(structureCreationData: StructureCreationDto): Observable<StructureModel | undefined> {
    // The StructureApiService expects 'any' but we pass our typed DTO.
    // The response is StructureCreationResponseDto which contains newToken and createdStructure.
    return this.structureApi.createStructure(structureCreationData).pipe(
      tap((response: StructureCreationResponseDto) => {
        if (response.newToken) {
          this.authService.updateTokenAndState(response.newToken);
        }
        if (response.createdStructure) {
          // Assuming API returns the created structure which matches StructureModel
          const newStructure = response.createdStructure as StructureModel;
          this.currentStructureDetailsSig.set(newStructure);
          // Optionally, clear areas cache as a new structure likely has no areas yet or they need to be fetched.
          this.currentStructureAreasSig.set([]);
          this.notification.displayNotification('Structure créée avec succès !', 'valid');
        } else {
          // Handle case where structure might not be returned directly
          this.notification.displayNotification('Structure créée, mais les détails n\'ont pas pu être récupérés immédiatement.', 'warning');
        }
      }),
      map(response => response.createdStructure as StructureModel | undefined), // Return only the structure model
      catchError(error => {
        this.handleError('Impossible de créer la structure.', error);
        return of(undefined);
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
  getStructures(params: StructureSearchParams = {}): Observable<StructureModel[]> {
    // `importance` and `eventsCount` are assumed to be included by default by the backend.
    // No need for includeImportanceStats or includeEventCount parameters here.
    return this.structureApi.getStructures(params).pipe(
      map((apiStructures: any[]): StructureModel[] => {
        // Transform raw API objects to StructureModel instances if necessary.
        // Assuming the structure from API matches StructureModel for now.
        let structures = apiStructures.map(s => this.mapApiToStructureModel(s));

        // Local sorting if sortBy is 'importance' and API might not sort it or data is mixed.
        // Best if API handles all sorting. This is a client-side fallback.
        if (params.sortBy === 'importance') {
          structures = [...structures].sort((a, b) => {
            const importanceA = a.importance ?? 0;
            const importanceB = b.importance ?? 0;
            const direction = params.sortDirection === 'desc' ? -1 : 1;
            return (importanceA - importanceB) * direction;
          });
        }
        return structures;
      }),
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
        if (structure) {
          // When a new structure is fetched as current, also fetch its areas.
          this.loadStructureAreas(structureId, true).subscribe();
        } else {
          this.currentStructureAreasSig.set([]); // Clear areas if structure not found
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer la structure #${structureId}.`, error);
        this.currentStructureDetailsSig.set(null);
        this.currentStructureAreasSig.set([]);
        return of(undefined);
      })
    );
  }

  /**
   * Updates an existing structure.
   * @param structureId - The ID of the structure to update.
   * @param structureUpdateData - The DTO containing fields to update.
   * @returns An Observable of the updated `StructureModel` or `undefined` on error.
   */
  updateStructure(structureId: number, structureUpdateData: StructureUpdateDto): Observable<StructureModel | undefined> {
    // StructureApiService expects Partial<any>, StructureUpdateDto is suitable.
    return this.structureApi.updateStructure(structureId, structureUpdateData).pipe(
      map(apiStructure => apiStructure ? this.mapApiToStructureModel(apiStructure) : undefined),
      tap(updatedStructure => {
        if (updatedStructure) {
          if (this.currentStructureDetailsSig()?.id === structureId) {
            this.currentStructureDetailsSig.set(updatedStructure);
          }
          // Optionally update a list cache if you maintain one for getStructures
          this.notification.displayNotification('Structure mise à jour avec succès.', 'valid');
        }
      }),
      catchError(error => {
        this.handleError('Impossible de mettre à jour la structure.', error);
        return of(undefined);
      })
    );
  }

  /**
   * Deletes a structure by its ID.
   * If the deleted structure was the current one, clears the current structure and its areas from cache.
   * @param structureId - The ID of the structure to delete.
   * @returns An Observable<boolean> indicating success (true) or failure (false).
   */
  deleteStructure(structureId: number): Observable<boolean> {
    return this.structureApi.deleteStructure(structureId).pipe(
      map(() => true), // API returns void, map to true for success
      tap(() => {
        if (this.currentStructureDetailsSig()?.id === structureId) {
          this.currentStructureDetailsSig.set(null);
          this.currentStructureAreasSig.set([]);
        }
        // Optionally, trigger a refresh of any list that might contain this structure.
        this.notification.displayNotification('Structure supprimée avec succès.', 'valid');
      }),
      catchError(error => {
        this.handleError('Impossible de supprimer la structure.', error);
        return of(false);
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

  // --- Structure Area (Physical Zones) Operations ---

  /**
   * Retrieves physical areas for a given structure.
   * Updates the `currentStructureAreasSig` if `structureId` matches the current structure.
   * @param structureId - The ID of the structure whose areas are to be fetched.
   * @param forceRefresh - If true, fetches from API even if cached for the current structure.
   * @returns An Observable of `StructureAreaModel[]`.
   */
  loadStructureAreas(structureId: number, forceRefresh = false): Observable<StructureAreaModel[]> {
    const isCurrentStructure = this.currentStructureDetailsSig()?.id === structureId;
    if (!forceRefresh && isCurrentStructure && this.currentStructureAreasSig().length > 0) {
      return of(this.currentStructureAreasSig());
    }
    if (isCurrentStructure) {
      this.currentStructureAreasSig.set([]); // Indicate loading for current structure's areas
    }

    return this.structureApi.getAreas(structureId).pipe(
      map((apiAreas: any[]): StructureAreaModel[] =>
        apiAreas.map(a => this.mapApiToAreaModel(a)) // Assuming API DTO matches StructureAreaModel
      ),
      tap(areas => {
        if (isCurrentStructure) {
          this.currentStructureAreasSig.set(areas);
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer les zones de la structure #${structureId}.`, error);
        if (isCurrentStructure) {
          this.currentStructureAreasSig.set([]); // Clear cache on error for current structure
        }
        return of([]);
      })
    );
  }


  /**
   * Crée une nouvelle area pour la structure courante
   */
  createArea(areaData: AreaCreationDto): Observable<StructureAreaModel | undefined> {
    const currentStructureId = this.currentStructureDetailsSig()?.id;
    if (!currentStructureId) {
      this.notification.displayNotification('Aucune structure sélectionnée', 'error');
      return of(undefined);
    }

    return this.structureApi.createArea(currentStructureId, areaData).pipe(
      tap(createdArea => {
        if (createdArea) {
          const currentAreas = this.currentStructureAreasSig();
          this.currentStructureAreasSig.set([...currentAreas, createdArea]);
          this.notification.displayNotification('Espace créé avec succès !', 'valid');
        }
      }),

      catchError(error => {
        this.handleError('Impossible de créer l\'espace.', error);
        return of(undefined);
      })
    );
  }

  /**
   * Met à jour une area existante
   */
  updateArea(areaId: number, areaData: AreaUpdateDto): Observable<StructureAreaModel | undefined> {
    const currentStructureId = this.currentStructureDetailsSig()?.id;
    if (!currentStructureId) {
      this.notification.displayNotification('Aucune structure sélectionnée', 'error');
      return of(undefined);
    }

    return this.structureApi.updateArea(currentStructureId, areaId, areaData).pipe(
      tap(updatedArea => {
        if (updatedArea) {
          const currentAreas = this.currentStructureAreasSig();
          const updatedAreas = currentAreas.map(area =>
            area.id === areaId ? updatedArea : area
          );
          this.currentStructureAreasSig.set(updatedAreas);
          this.notification.displayNotification('Espace modifié avec succès !', 'valid');
        }
      }),
      catchError(error => {
        this.handleError('Impossible de modifier l\'espace.', error);
        return of(undefined);
      })
    );
  }

  /**
   * Supprime une area
   */
  deleteArea(areaId: number): Observable<boolean> {
    const currentStructureId = this.currentStructureDetailsSig()?.id;
    if (!currentStructureId) {
      this.notification.displayNotification('Aucune structure sélectionnée', 'error');
      return of(false);
    }

    return this.structureApi.deleteArea(currentStructureId, areaId).pipe(
      tap(() => {
        // Retirer l'area du cache
        const currentAreas = this.currentStructureAreasSig();
        const filteredAreas = currentAreas.filter(area => area.id !== areaId);
        this.currentStructureAreasSig.set(filteredAreas);
        this.notification.displayNotification('Espace supprimé avec succès !', 'valid');
      }),
      map(() => true),
      catchError(error => {
        this.handleError('Impossible de supprimer l\'espace.', error);
        return of(false);
      })
    );
  }

  loadAllAudienceZones(forceRefresh = false): Observable<EventAudienceZone[]> {
    if (!forceRefresh) {
      const cached = this.currentStructureAudienceZonesSig();
      if (cached.length > 0) {
        return of(cached);
      }
    }

    const currentStructureId = this.currentStructureDetailsSig()?.id;

    if (!currentStructureId) {
      return of([]);
    }

    let allAudienceZones: EventAudienceZone[] = [];

    this.currentStructureAreas().forEach((area) =>
      this.structureApi.getAreaAudienceZones(currentStructureId, area.id).pipe(
        map((apiZones: any[]) => apiZones.map(zone => this.mapApiToAudienceZoneModel(zone))),
        tap(zones => allAudienceZones.push(...zones)),
        catchError(error => {
          this.handleError('Impossible de charger les zones d\'audience.', error);
          return of([]);
        })
      )
    );

    this.currentStructureAudienceZonesSig.set(allAudienceZones);
    return of(allAudienceZones);
  }

  /**
   * Loads audience zones for a specific area
   */
  loadAreaAudienceZones(areaId: number, forceRefresh = false): Observable<EventAudienceZone[]> {
    if (!forceRefresh) {
      const cached = this.currentAreaAudienceZonesSig();
      if (cached.length > 0 && cached[0]?.areaId === areaId) {
        return of(cached);
      }
    }

    const currentStructureId = this.currentStructureDetailsSig()?.id;
    if (!currentStructureId) {
      return of([]);
    }

    return this.structureApi.getAreaAudienceZones(currentStructureId, areaId).pipe(
      map((apiZones: any[]) => apiZones.map(zone => this.mapApiToAudienceZoneModel(zone))),
      tap(zones => this.currentAreaAudienceZonesSig.set(zones)),
      catchError(error => {
        this.handleError('Impossible de charger les zones d\'audience.', error);
        return of([]);
      })
    );
  }

  /**
   * Creates a new audience zone for an area
   */
  createAudienceZone(areaId: number, zoneData: AudienceZoneCreationDto): Observable<EventAudienceZone | undefined> {
    const currentStructureId = this.currentStructureDetailsSig()?.id;
    if (!currentStructureId) {
      this.notification.displayNotification('Aucune structure sélectionnée', 'error');
      return of(undefined);
    }

    return this.structureApi.createAreaAudienceZone(currentStructureId, areaId, zoneData).pipe(
      map(apiZone => apiZone ? this.mapApiToAudienceZoneModel(apiZone) : undefined),
      tap(createdZone => {
        if (createdZone) {
          const currentZones = this.currentAreaAudienceZonesSig();
          this.currentAreaAudienceZonesSig.set([...currentZones, createdZone]);
          this.notification.displayNotification('Zone d\'audience créée avec succès !', 'valid');
        }
      }),
      catchError(error => {
        this.handleError('Impossible de créer la zone d\'audience.', error);
        return of(undefined);
      })
    );
  }

  /**
   * Updates an existing audience zone
   */
  updateAudienceZone(areaId: number, zoneId: number, zoneData: AudienceZoneUpdateDto): Observable<EventAudienceZone | undefined> {
    const currentStructureId = this.currentStructureDetailsSig()?.id;
    if (!currentStructureId) {
      this.notification.displayNotification('Aucune structure sélectionnée', 'error');
      return of(undefined);
    }

    return this.structureApi.updateAreaAudienceZone(currentStructureId, areaId, zoneId, zoneData).pipe(
      map(apiZone => apiZone ? this.mapApiToAudienceZoneModel(apiZone) : undefined),
      tap(updatedZone => {
        if (updatedZone) {
          const currentZones = this.currentAreaAudienceZonesSig();
          const updatedZones = currentZones.map(zone =>
            zone.id === zoneId ? updatedZone : zone
          );
          this.currentAreaAudienceZonesSig.set(updatedZones);
          this.notification.displayNotification('Zone d\'audience modifiée avec succès !', 'valid');
        }
      }),
      catchError(error => {
        this.handleError('Impossible de modifier la zone d\'audience.', error);
        return of(undefined);
      })
    );
  }

  /**
   * Deletes an audience zone
   */
  deleteAudienceZone(areaId: number, zoneId: number): Observable<boolean> {
    const currentStructureId = this.currentStructureDetailsSig()?.id;
    if (!currentStructureId) {
      this.notification.displayNotification('Aucune structure sélectionnée', 'error');
      return of(false);
    }

    return this.structureApi.deleteAreaAudienceZone(currentStructureId, areaId, zoneId).pipe(
      tap(() => {
        const currentZones = this.currentAreaAudienceZonesSig();
        const filteredZones = currentZones.filter(zone => zone.id !== zoneId);
        this.currentAreaAudienceZonesSig.set(filteredZones);
        this.notification.displayNotification('Zone d\'audience supprimée avec succès !', 'valid');
      }),
      map(() => true),
      catchError(error => {
        this.handleError('Impossible de supprimer la zone d\'audience.', error);
        return of(false);
      })
    );
  }

  /**
   * Clears the audience zones cache
   */
  clearAudienceZonesCache(): void {
    this.currentAreaAudienceZonesSig.set([]);
  }

// Méthode de transformation privée
  private mapApiToAudienceZoneModel(apiZone: any): EventAudienceZone {
    return {
      id: apiZone.id,
      name: apiZone.name,
      areaId: apiZone.areaId,
      maxCapacity: apiZone.maxCapacity,
      isActive: apiZone.isActive,
      seatingType: apiZone.seatingType,
    };
  }

  // --- Utility Methods ---

  /**
   * Creates an empty `StructureAddressModel` object, typically for initializing forms.
   * @returns An empty `StructureAddressModel`.
   */
  createEmptyAddress(): StructureAddressModel {
    return {
      country: '',
      city: '',
      street: '',
      zipCode: ''
      // number is optional
    };
  }

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
  private mapApiToStructureModel(apiStructure: any): StructureModel {
    // Perform transformations if apiStructure is not identical to StructureModel
    // For example, date string to Date objects.
    return {
      ...apiStructure,
      types: (apiStructure.types || []).map((t: any) => this.mapApiToStructureTypeModel(t)),
      areas: (apiStructure.areas || []).map((a: any) => this.mapApiToAreaModel(a)),
      createdAt: new Date(apiStructure.createdAt), // Ensure dates are Date objects
      updatedAt: apiStructure.updatedAt ? new Date(apiStructure.updatedAt) : undefined,
    } as StructureModel;
  }

  private mapApiToStructureTypeModel(apiType: any): StructureTypeModel {
    return apiType as StructureTypeModel; // Direct cast if API DTO matches
  }

  private mapApiToAreaModel(apiArea: any): StructureAreaModel {
    return apiArea as StructureAreaModel; // Direct cast if API DTO matches
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
