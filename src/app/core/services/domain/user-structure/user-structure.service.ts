import {computed, DestroyRef, effect, inject, Injectable, signal, untracked, WritableSignal} from '@angular/core';
import {UserService} from '../user/user.service';
import {StructureService} from '../structure/structure.service';
import {AuthService} from '../user/auth.service';
import {NotificationService} from '../utilities/notification.service';
import {
  StructureCreationDto,
  StructureCreationResponseDto,
  StructureModel,
  StructureUpdateDto
} from '../../../models/structure/structure.model';
import {BehaviorSubject, forkJoin, Observable, of, throwError} from 'rxjs';
import {catchError, filter, map, switchMap, take, tap} from 'rxjs/operators';
import {AreaCreationDto, AreaUpdateDto, StructureAreaModel} from '../../../models/structure/structure-area.model';
import {EventSummaryModel} from '../../../models/event/event.model';
import {EventService} from '../event/event.service';
import {UserRole} from '../../../models/user/user-role.enum';
import {
  AudienceZoneTemplateCreationDto,
  AudienceZoneTemplateModel,
  AudienceZoneTemplateUpdateDto
} from '../../../models/structure/AudienceZoneTemplate.model';
import {StructureApiService} from '../../api/structure/structure-api.service';
import {FileUploadResponseDto} from '../../../models/files/file-upload-response.model';
import {Router} from '@angular/router';
import {UserModel} from '../../../models/user/user.model';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {StructureSearchParams} from '../../../models/structure/structure-search-params.model';
import {StructureSummaryModel} from '../../../models/structure/structure-summary.model';


/**
 * Service dédié à la gestion de la structure associée à l'utilisateur connecté.
 * Centralise la logique de chargement et de mise en cache de la structure utilisateur.
 */
@Injectable({
  providedIn: 'root'
})
export class UserStructureService {
  private userService = inject(UserService);
  private structureService = inject(StructureService);
  private structureApi = inject(StructureApiService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private currentUserSig: WritableSignal<UserModel | null | undefined> = signal(undefined);
  public readonly currentUser = computed(() => this.currentUserSig());

  // Signal pour la structure de l'utilisateur
  private userStructureSig: WritableSignal<StructureModel | null | undefined> = signal(undefined);
  public readonly userStructure = computed(() => this.userStructureSig());

  private userStructureEventsSig: WritableSignal<EventSummaryModel[]> = signal([]);
  public readonly userStructureEvents = computed(() => this.userStructureEventsSig());

  // Signal pour les espaces de la structure utilisateur
  private userStructureAreasSig: WritableSignal<StructureAreaModel[]> = signal([]);
  public readonly userStructureAreas = computed(() => this.userStructureAreasSig());

  // Signal pour les templates de zones d'audience de l'espace sélectionné
  private currentAreaAudienceZoneTemplatesSig: WritableSignal<AudienceZoneTemplateModel[]> = signal([]);
  public readonly currentAreaAudienceZoneTemplates = computed(() => this.currentAreaAudienceZoneTemplatesSig());

  // Signal pour l'état de chargement
  private isLoadingSig: WritableSignal<boolean> = signal(false);
  public readonly isLoading = computed(() => this.isLoadingSig());

  // Signal pour indiquer si l'utilisateur a une structure
  public readonly hasStructure = computed(() => {
    const structure = this.userStructureSig();
    return structure !== null && structure !== undefined;
  });

  // Signal pour indiquer si toutes les données de structure sont chargées
  private isStructureDataLoadedSig: WritableSignal<boolean> = signal(false);
  public readonly isStructureDataLoaded = computed(() => this.isStructureDataLoadedSig());

  // Signal pour l'ID de la structure utilisateur
  public readonly userStructureId = computed(() => {
    const userProfile = this.userService.currentUserProfileData();
    return userProfile?.structureId || null;
  });

  // BehaviorSubject pour les observables de refresh
  private refreshCompletedSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    // Effect pour charger toutes les données quand l'utilisateur ou son profil change
    effect(() => {
      const authUser = this.authService.currentUser();

      if (authUser && authUser.structureId) {
        untracked(() => {
          // Vérifier si la structure actuelle correspond toujours
          const currentStructure = this.userStructureSig();
          if (!currentStructure || currentStructure.id !== authUser.structureId && authUser.structureId) {
            console.log('Loading structure data for structureId:', authUser.structureId);
            this.loadAllStructureData(authUser.structureId!);
          }
        });
      } else {
        // Pas d'utilisateur connecté ou pas de structure assignée
        untracked(() => {
          this.resetStructureData();
        });
      }
    });
  }


  /**
   * Checks if the current user has permission to manage structures.
   * Only users with STRUCTURE_ADMINISTRATOR role can manage structures.
   * @returns True if the user has permission, false otherwise.
   */
  hasStructureManagementPermission(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    return currentUser.role === UserRole.STRUCTURE_ADMINISTRATOR;
  }

  /**
   * Checks if the current user has permission to manage areas and audience zones.
   * Users with STRUCTURE_ADMINISTRATOR or ORGANIZATION_SERVICE roles can manage areas and audience zones.
   * @returns True if the user has permission, false otherwise.
   */
  hasAreaManagementPermission(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    return currentUser.role === UserRole.STRUCTURE_ADMINISTRATOR ||
      currentUser.role === UserRole.ORGANIZATION_SERVICE;
  }

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

            // AJOUT : Forcer le rechargement du profil utilisateur
            this.userService.getCurrentUserProfile(true).subscribe({
              next: () => {
                console.log('User profile refreshed after structure creation');
                // Déclencher le chargement des données de structure
                const currentUser = this.authService.currentUser();
                if (currentUser?.structureId) {
                  this.loadAllStructureData(currentUser.structureId);
                }
              },
              error: (error) => {
                console.error('Error refreshing user profile:', error);
              }
            });

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
   * Charge toutes les données liées à la structure de l'utilisateur
   * Cette méthode centralise le chargement de toutes les données nécessaires
   */
  private loadAllStructureData(structureId?: number): void {

    let userStructureId: number;

    if (!structureId) {
      const userProfile = this.userService.currentUserProfileData();
      if (!userProfile?.structureId) {
        this.resetStructureData();
        return;
      }
      userStructureId = userProfile.structureId;
    } else {
      userStructureId = structureId;
    }


    console.log('UserStructureService: Chargement de toutes les données de structure...');
    this.isLoadingSig.set(true);
    this.isStructureDataLoadedSig.set(false);

    // 1. Charger d'abord la structure principale
    this.structureService.getStructureById(userStructureId, true).pipe(
      tap(structure => {
        this.userStructureSig.set(structure || null);

        if (structure) {
          this.authService.updateUserStructureContext(structure.id!);
        }
      }),
      // 2. Puis charger les areas en parallèle si la structure existe
      switchMap(structure => {
        if (!structure) {
          return of({structure: null, areas: [], events: []});
        }

        return forkJoin({
          structure: of(structure),
          areas: this.loadStructureAreas(structure.id!),
          events: this.eventService.getEventsByStructure(structure.id!)
        });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        console.log('UserStructureService: Toutes les données chargées:', result);

        if (result.structure) {
          this.userStructureAreasSig.set(result.areas);
          this.userStructureEventsSig.set(result.events);
        }

        this.isLoadingSig.set(false);
        this.isStructureDataLoadedSig.set(true);
        this.refreshCompletedSubject.next(true);
      },
      error: (error) => {
        console.error('UserStructureService: Erreur lors du chargement des données:', error);
        this.isLoadingSig.set(false);
        this.isStructureDataLoadedSig.set(false);
        this.refreshCompletedSubject.next(false);
        this.handleError('Erreur lors du chargement des données', error);
      }
    });
  }

  /**
   * Charge les areas d'une structure
   */
  private loadStructureAreas(structureId: number): Observable<StructureAreaModel[]> {
    return this.structureApi.getStructureAreas(structureId).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement des areas:', error);
        return of([]);
      })
    );
  }

  /**
   * Réinitialise toutes les données de structure
   */
  private resetStructureData(): void {
    this.userStructureSig.set(null);
    this.userStructureAreasSig.set([]);
    this.userStructureEventsSig.set([]);
    this.isLoadingSig.set(false);
    this.isStructureDataLoadedSig.set(false);
  }

  /**
   * Force le rechargement de toutes les données de structure
   * Version simplifiée utilisant BehaviorSubject au lieu de toObservable()
   */
  refreshAllStructureData(): Observable<boolean> {
    // Déclencher le rechargement
    const userProfile = this.userService.currentUserProfileData();
    if (!userProfile?.structureId) {
      return of(false);
    }

    this.loadAllStructureData();

    // Retourner un observable qui émet quand le chargement est terminé
    return this.refreshCompletedSubject.pipe(
      filter(completed => completed === true),
      take(1),
      map(() => true)
    );
  }


  /**
   * Gets events for the structure associated with the current user.
   * @param forceRefresh - If true, forces a refresh from the API.
   * @returns Observable of EventModel[] or empty array if no structure ID is associated.
   */
  getUserStructureEvents(forceRefresh = false): Observable<EventSummaryModel[]> {
    const userStructureId = this.authService.userStructureId();
    if (!userStructureId) {
      return of([]);
    }

    if (!forceRefresh && this.userStructureEventsSig().length > 0) {
      return of(this.userStructureEventsSig());
    }

    return this.eventService.getEventsByStructure(userStructureId).pipe(
      tap(events => this.userStructureEventsSig.set(events)),
      catchError(error => {
        // this.handleError('Impossible de récupérer les événements de votre structure.', error);
        return of([]);
      })
    );
  }

  /**
   * Charge la structure de l'utilisateur connecté.
   * @param forceRefresh - Force le rechargement depuis l'API.
   * @returns Observable de la structure chargée.
   */
  loadUserStructure(forceRefresh = false): Observable<StructureModel | undefined> {
    const userProfile = this.userService.currentUserProfileData();

    if (!userProfile?.structureId) {
      this.userStructureSig.set(null);
      return of(undefined);
    }

    const currentStructure = this.userStructureSig();
    if (!forceRefresh && currentStructure?.id === userProfile.structureId) {
      return of(currentStructure);
    }

    this.isLoadingSig.set(true);

    return this.structureService.getStructureById(userProfile.structureId, forceRefresh).pipe(
      tap(structure => {
        this.userStructureSig.set(structure || null);
        this.isLoadingSig.set(false);

        if (structure) {
          // Mettre à jour le signal d'AuthService si nécessaire
          this.authService.updateUserStructureContext(structure.id!);
        }
      }),
      catchError(error => {
        this.userStructureSig.set(null);
        this.isLoadingSig.set(false);
        this.notification.displayNotification(
          'Erreur lors du chargement de votre structure.',
          'error'
        );
        return of(undefined);
      })
    );
  }

  /**
   * Rafraîchit la structure utilisateur depuis l'API.
   */
  refreshUserStructure(): Observable<StructureModel | undefined> {
    return this.loadUserStructure(true);
  }


  /**
   * Updates an existing structure.
   * @param structureId - The ID of the structure to update.
   * @param structureUpdateData - The DTO containing fields to update.
   * @returns An Observable of the updated `StructureModel` or `undefined` on error.
   */
  updateStructure(structureId: number, structureUpdateData: StructureUpdateDto): Observable<StructureModel | undefined> {
    // Check if user has permission to manage structures
    if (!this.hasStructureManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour modifier une structure.',
        'error'
      );
      return of(undefined);
    }
    return this.structureApi.updateStructure(structureId, structureUpdateData).pipe(
      // map(apiStructure => apiStructure ? this.mapApiToStructureModel(apiStructure) : undefined),
      tap(updatedStructure => {
        if (updatedStructure) {
          if (this.userStructureSig()?.id === structureId) {
            this.userStructureSig.set(updatedStructure);
          }
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
    // Check if user has permission to manage structures
    if (!this.hasStructureManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour supprimer une structure.',
        'error'
      );
      return of(false);
    }

    return this.structureApi.deleteStructure(structureId).pipe(
      map(() => true), // API returns void, map to true for success
      tap(() => {
        // Clear local structure data
        if (this.userStructureSig()?.id === structureId) {
          this.userStructureSig.set(null);
          this.userStructureAreasSig.set([]);
          this.userStructureEventsSig.set([]);
        }

        this.notification.displayNotification('Structure supprimée avec succès.', 'valid');

        // Force refresh of authentication and user data
        this.refreshUserDataAfterStructureChange();
      }),
      catchError(error => {
        this.handleError('Impossible de supprimer la structure.', error);
        return of(false);
      })
    );
  }

  /**
   * Refreshes user data after structure changes
   * Updates token, user profile, and triggers UI refresh
   */
  private refreshUserDataAfterStructureChange(): void {
    // Refresh token to get updated claims
    this.authService.refreshToken().pipe(
      switchMap(() => {
        // Refresh user profile to get updated structureId
        return this.userService.getCurrentUserProfile(true);
      }),
      tap(() => {
        // Navigate to appropriate page based on user's new state
        const currentUser = this.authService.currentUser();
        if (currentUser && !currentUser.structureId) {
          // User no longer has a structure, redirect to dashboard
          this.router.navigate(['/']);
        }
      })
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          console.error('Erreur lors de la mise à jour des données utilisateur:', error);
          this.notification.displayNotification(
            'Erreur lors de la mise à jour. Veuillez vous reconnecter.',
            'error'
          );
        }
      });
  }

  /**
   * Supprime une image de la structure
   * @param structureId ID de la structure
   * @param type Le type d'image ('logo' ou 'cover')
   * @returns Observable vide
   */
  deleteStructureImage(structureId: number, type: 'logo' | 'cover'): Observable<void> {
    return this.structureApi.deleteStructureImage(structureId, type);
  }

  /**
   * Upload une image pour la structure (logo ou couverture)
   * @param structureId ID de la structure
   * @param file Le fichier image à uploader
   * @param type Le type d'image ('logo' ou 'cover')
   * @returns Observable contenant l'URL de l'image uploadée
   */
  uploadStructureImage(structureId: number, file: File, type: 'logo' | 'cover'): Observable<{
    fileName: string;
    fileUrl: string;
    message: string
  }> {
    return this.structureApi.uploadStructureImage(structureId, file, type);
  }

  /**
   * Upload multiple images pour la galerie de la structure
   * @param structureId ID de la structure
   * @param files Les fichiers images à uploader
   * @returns Observable contenant la liste des URLs des images uploadées
   */
  uploadMultipleGalleryImages(structureId: number, files: File[]): Observable<FileUploadResponseDto[]> {
    return this.structureApi.uploadMultipleGalleryImages(structureId, files);
  }

  /**
   * Supprime une image de la galerie
   * @param structureId ID de la structure
   * @param imagePath URL de l'image à supprimer
   * @returns Observable vide
   */
  deleteGalleryImage(structureId: number, imagePath: string): Observable<void> {
    return this.structureApi.deleteGalleryImage(structureId, imagePath);
  }

  // --- Structure Area (Physical Zones) Operations ---

  /**
   * Loads areas for the current user's structure.
   * @param forceRefresh - If true, forces a refresh from the API.
   */
  loadUserStructureAreas(forceRefresh = false): Observable<StructureAreaModel[]> {
    const structureId = this.userStructureId();
    if (!structureId) {
      this.notification.displayNotification('Aucune structure associée.', 'error');
      return of([]);
    }

    if (!forceRefresh && this.userStructureAreasSig().length > 0) {
      return of(this.userStructureAreasSig());
    }

    return this.structureApi.getStructureAreas(structureId).pipe(
      map(apiAreas => apiAreas.map(apiArea => this.structureService.mapApiToAreaModel(apiArea))),
      tap(areas => {
        this.userStructureAreasSig.set(areas);
      }),
      catchError(error => {
        this.notification.displayNotification(
          `Impossible de récupérer les espaces de la structure #${structureId}.`,
          'error'
        );
        return of([]);
      })
    );
  }

  /**
   * Creates a new area for the current user's structure.
   * @param areaCreationData - The DTO for creating the area.
   */
  createArea(areaCreationData: AreaCreationDto): Observable<StructureAreaModel | undefined> {
    const structureId = this.userStructureId();
    if (!structureId) {
      this.notification.displayNotification('Aucune structure associée.', 'error');
      return of(undefined);
    }

    // Check if user has permission to manage areas
    if (!this.hasAreaManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour créer un espace.',
        'error'
      );
      return of(undefined);
    }

    return this.structureApi.createArea(structureId, areaCreationData).pipe(
      map(apiArea => apiArea ? this.structureService.mapApiToAreaModel(apiArea) : undefined),
      tap(area => {
        if (area) {
          const currentAreas = this.userStructureAreasSig();
          this.userStructureAreasSig.set([...currentAreas, area]);
          this.notification.displayNotification('Espace créé avec succès !', 'valid');
        }
      }),
      catchError(error => {
        this.notification.displayNotification('Impossible de créer l\'espace.', 'error');
        return of(undefined);
      })
    );
  }

  /**
   * Updates an existing area in the current user's structure.
   * @param areaId - The ID of the area to update.
   * @param areaUpdateData - The DTO for updating the area.
   */
  updateArea(areaId: number, areaUpdateData: AreaUpdateDto): Observable<StructureAreaModel | undefined> {
    const structureId = this.userStructureId();
    if (!structureId) {
      this.notification.displayNotification('Aucune structure associée.', 'error');
      return of(undefined);
    }

    // Check if user has permission to manage areas
    if (!this.hasAreaManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour modifier un espace.',
        'error'
      );
      return of(undefined);
    }

    return this.structureApi.updateArea(structureId, areaId, areaUpdateData).pipe(
      map(apiArea => apiArea ? this.structureService.mapApiToAreaModel(apiArea) : undefined),
      tap(updatedArea => {
        if (updatedArea) {
          const currentAreas = this.userStructureAreasSig();
          const updatedAreas = currentAreas.map(area =>
            area.id === areaId ? updatedArea : area
          );
          this.userStructureAreasSig.set(updatedAreas);
          this.notification.displayNotification('Espace mis à jour avec succès !', 'valid');
        }
      }),
      catchError(error => {
        this.notification.displayNotification('Impossible de mettre à jour l\'espace.', 'error');
        return of(undefined);
      })
    );
  }

  /**
   * Deletes an area from the current user's structure.
   * @param areaId - The ID of the area to delete.
   */
  deleteArea(areaId: number): Observable<boolean> {
    const structureId = this.userStructureId();
    if (!structureId) {
      this.notification.displayNotification('Aucune structure associée.', 'error');
      return of(false);
    }

    // Check if user has permission to manage areas
    if (!this.hasAreaManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour supprimer un espace.',
        'error'
      );
      return of(false);
    }

    return this.structureApi.deleteArea(structureId, areaId).pipe(
      map(() => true), // API returns void, map to true for success
      tap(() => {
        const currentAreas = this.userStructureAreasSig();
        const filteredAreas = currentAreas.filter(area => area.id !== areaId);
        this.userStructureAreasSig.set(filteredAreas);

        // Clear templates if any were loaded for this area
        this.currentAreaAudienceZoneTemplatesSig.set([]);

        this.notification.displayNotification('Espace supprimé avec succès !', 'valid');
      }),
      catchError(error => {
        this.notification.displayNotification('Impossible de supprimer l\'espace.', 'error');
        return of(false);
      })
    );
  }

  /**
   * Loads audience zone templates for a specific area.
   * @param areaId - The ID of the area.
   */
  loadAreaAudienceZoneTemplates(areaId: number): Observable<AudienceZoneTemplateModel[]> {
    const structureId = this.userStructureId();
    if (!structureId) {
      this.notification.displayNotification('Aucune structure associée.', 'error');
      return of([]);
    }

    // Find the area and use its templates if already loaded
    const area = this.userStructureAreasSig().find(a => a.id === areaId);
    if (area?.audienceZoneTemplates) {
      this.currentAreaAudienceZoneTemplatesSig.set(area.audienceZoneTemplates);
      return of(area.audienceZoneTemplates);
    }

    // If templates are not available, we need to reload the area to get its templates
    // This is because templates come with area data in the API
    return this.structureApi.getStructureAreas(structureId).pipe(
      map(apiAreas => {
        const apiArea = apiAreas.find(a => a.id === areaId);
        if (!apiArea) {
          return [];
        }
        const area = this.structureService.mapApiToAreaModel(apiArea);
        return area.audienceZoneTemplates || [];
      }),
      tap(templates => {
        this.currentAreaAudienceZoneTemplatesSig.set(templates);

        // Also update the area in the areas signal to include the templates
        const currentAreas = this.userStructureAreasSig();
        const updatedAreas = currentAreas.map(area => {
          if (area.id === areaId) {
            return {...area, audienceZoneTemplates: templates};
          }
          return area;
        });
        this.userStructureAreasSig.set(updatedAreas);
      }),
      catchError(error => {
        this.notification.displayNotification(
          `Impossible de récupérer les templates de zones pour l'espace #${areaId}.`,
          'error'
        );
        return of([]);
      })
    );
  }

  /**
   * Creates a new audience zone template for an area.
   * @param areaId - The ID of the area.
   * @param templateCreationData - The DTO for creating the template.
   */
  createAudienceZoneTemplate(areaId: number, templateCreationData: AudienceZoneTemplateCreationDto): Observable<AudienceZoneTemplateModel | undefined> {
    const structureId = this.userStructureId();
    if (!structureId) {
      this.notification.displayNotification('Aucune structure associée.', 'error');
      return of(undefined);
    }

    // Check if user has permission to manage areas and audience zones
    if (!this.hasAreaManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour créer une zone d\'audience.',
        'error'
      );
      return of(undefined);
    }

    return this.structureApi.createAudienceZoneTemplate(structureId, areaId, templateCreationData).pipe(
      map(apiTemplate => apiTemplate ? this.structureService.mapApiToAudienceZoneTemplateModel(apiTemplate) : undefined),
      tap(template => {
        if (template) {
          // Update the area's templates in the areas signal
          const currentAreas = this.userStructureAreasSig();
          const updatedAreas = currentAreas.map(area => {
            if (area.id === areaId) {
              const currentTemplates = area.audienceZoneTemplates || [];
              return {
                ...area,
                audienceZoneTemplates: [...currentTemplates, template]
              };
            }
            return area;
          });
          this.userStructureAreasSig.set(updatedAreas);

          // Update current templates signal
          const currentTemplates = this.currentAreaAudienceZoneTemplatesSig();
          this.currentAreaAudienceZoneTemplatesSig.set([...currentTemplates, template]);

          this.notification.displayNotification('Zone d\'audience créée avec succès !', 'valid');
        }
      }),
      catchError(error => {
        this.notification.displayNotification('Impossible de créer la zone d\'audience.', 'error');
        return of(undefined);
      })
    );
  }

  /**
   * Updates an existing audience zone template.
   * @param areaId - The ID of the area.
   * @param templateId - The ID of the template to update.
   * @param templateUpdateData - The DTO for updating the template.
   */
  updateAudienceZoneTemplate(areaId: number, templateId: number, templateUpdateData: AudienceZoneTemplateUpdateDto): Observable<AudienceZoneTemplateModel | undefined> {
    const structureId = this.userStructureId();
    if (!structureId) {
      this.notification.displayNotification('Aucune structure associée.', 'error');
      return of(undefined);
    }

    // Check if user has permission to manage areas and audience zones
    if (!this.hasAreaManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour modifier une zone d\'audience.',
        'error'
      );
      return of(undefined);
    }

    return this.structureApi.updateAudienceZoneTemplate(structureId, areaId, templateId, templateUpdateData).pipe(
      map(apiTemplate => apiTemplate ? this.structureService.mapApiToAudienceZoneTemplateModel(apiTemplate) : undefined),
      tap(updatedTemplate => {
        if (updatedTemplate) {
          // Update the area's templates in the areas signal
          const currentAreas = this.userStructureAreasSig();
          const updatedAreas = currentAreas.map(area => {
            if (area.id === areaId && area.audienceZoneTemplates) {
              const updatedTemplates = area.audienceZoneTemplates.map(template =>
                template.id === templateId ? updatedTemplate : template
              );
              return {
                ...area,
                audienceZoneTemplates: updatedTemplates
              };
            }
            return area;
          });
          this.userStructureAreasSig.set(updatedAreas);

          // Update current templates signal
          const currentTemplates = this.currentAreaAudienceZoneTemplatesSig();
          const updatedCurrentTemplates = currentTemplates.map(template =>
            template.id === templateId ? updatedTemplate : template
          );
          this.currentAreaAudienceZoneTemplatesSig.set(updatedCurrentTemplates);

          this.notification.displayNotification('Zone d\'audience mise à jour avec succès !', 'valid');
        }
      }),
      catchError(error => {
        this.notification.displayNotification('Impossible de mettre à jour la zone d\'audience.', 'error');
        return of(undefined);
      })
    );
  }

  /**
   * Deletes an audience zone template.
   * @param areaId - The ID of the area.
   * @param templateId - The ID of the template to delete.
   */
  deleteAudienceZoneTemplate(areaId: number, templateId: number): Observable<boolean> {
    const structureId = this.userStructureId();
    if (!structureId) {
      this.notification.displayNotification('Aucune structure associée.', 'error');
      return of(false);
    }

    // Check if user has permission to manage areas and audience zones
    if (!this.hasAreaManagementPermission()) {
      this.notification.displayNotification(
        'Vous n\'avez pas les droits nécessaires pour supprimer une zone d\'audience.',
        'error'
      );
      return of(false);
    }

    return this.structureApi.deleteAudienceZoneTemplate(structureId, areaId, templateId).pipe(
      map(() => true), // API returns void, map to true for success
      tap(() => {
        // Update the area's templates in the areas signal
        const currentAreas = this.userStructureAreasSig();
        const updatedAreas = currentAreas.map(area => {
          if (area.id === areaId && area.audienceZoneTemplates) {
            const filteredTemplates = area.audienceZoneTemplates.filter(template => template.id !== templateId);
            return {
              ...area,
              audienceZoneTemplates: filteredTemplates
            };
          }
          return area;
        });
        this.userStructureAreasSig.set(updatedAreas);

        // Update current templates signal
        const currentTemplates = this.currentAreaAudienceZoneTemplatesSig();
        const filteredCurrentTemplates = currentTemplates.filter(template => template.id !== templateId);
        this.currentAreaAudienceZoneTemplatesSig.set(filteredCurrentTemplates);

        this.notification.displayNotification('Zone d\'audience supprimée avec succès !', 'valid');
      }),
      catchError(error => {
        this.notification.displayNotification('Impossible de supprimer la zone d\'audience.', 'error');
        return of(false);
      })
    );
  }


  /**
   * Centralized error handler for structure-related operations.
   * Logs the error and displays a notification.
   * @param message - The user-facing message to display.
   * @param error - The error object from the API call.
   */
  private handleError(message: string, error: any): void {
    // The error object from StructureApiService already contains a user-friendly 'message'
    console.error(`UserStructureService Error: ${message}`, error.originalError || error);
    this.notification.displayNotification(
      error.message || message, // Use error.message if provided by handleStructureError
      'error'
    );
  }
}
