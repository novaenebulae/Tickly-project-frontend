import {Injectable} from '@angular/core';


import {inject, signal, computed, WritableSignal, effect, untracked} from '@angular/core';
import {UserService} from '../user/user.service';
import {StructureService} from '../structure/structure.service';
import {AuthService} from '../user/auth.service';
import {NotificationService} from '../utilities/notification.service';
import {
  StructureModel,
  StructureCreationDto,
  StructureUpdateDto,
  StructureCreationResponseDto
} from '../../../models/structure/structure.model';
import {Observable, of} from 'rxjs';
import {catchError, map, tap, switchMap} from 'rxjs/operators';
import {StructureAreaModel, AreaCreationDto, AreaUpdateDto} from '../../../models/structure/structure-area.model';
import {EventModel, EventSummaryModel} from '../../../models/event/event.model';
import {EventService} from '../event/event.service';
import {UserRole} from '../../../models/user/user-role.enum';
import {
  AudienceZoneTemplateCreationDto,
  AudienceZoneTemplateModel,
  AudienceZoneTemplateUpdateDto
} from '../../../models/structure/AudienceZoneTemplate.model';
import {StructureApiService} from '../../api/structure/structure-api.service';
import {EventAudienceZone} from '../../../models/event/event-audience-zone.model';
import {FileUploadResponseDto} from '../../../models/files/file-upload-response.model';
import {Router} from '@angular/router';
import {ApiConfigService} from '../../api/api-config.service';


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
  private apiConfig = inject(ApiConfigService);

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

  // Signal pour l'ID de la structure utilisateur
  public readonly userStructureId = computed(() => {
    const userProfile = this.userService.currentUserProfileData();
    return userProfile?.structureId || null;
  });

  constructor() {
    // Effect pour charger la structure quand l'utilisateur ou son profil change
    effect(() => {
      const authUser = this.authService.currentUser();
      const userProfile = this.userService.currentUserProfileData();

      if (authUser && userProfile?.structureId) {
        untracked(() => {
          // Vérifier si la structure actuelle correspond toujours
          const currentStructure = this.userStructureSig();
          if (!currentStructure || currentStructure.id !== userProfile.structureId) {
            this.loadUserStructure().subscribe();
            this.getUserStructureEvents().subscribe();
          }
        });
      } else {
        // Pas d'utilisateur connecté ou pas de structure assignée
        untracked(() => {
          this.userStructureSig.set(authUser ? null : undefined);
        });
      }
    });
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

  private refreshStructureEvents(force = true): Observable<EventSummaryModel[]> {
    return this.getUserStructureEvents(force);
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
   * Nettoie le cache de la structure utilisateur.
   */
  clearUserStructure(): void {
    this.userStructureSig.set(undefined);
  }

  /**
   * Vérifie si l'utilisateur actuel fait partie d'une structure donnée.
   * @param structureId - ID de la structure à vérifier.
   * @returns True si l'utilisateur fait partie de cette structure.
   */
  isUserInStructure(structureId: number): boolean {
    const userStructure = this.userStructureSig();
    return userStructure?.id === structureId;
  }


  // /**
  //  * Relie un utilisateur à une structure avec un rôle spécifique.
  //  * @param email - L'email de l'utilisateur à relier
  //  * @param role - Le nouveau rôle à assigner à l'utilisateur
  //  * @returns Observable du résultat de l'opération
  //  */
  // linkUserToStructure(email: string, role: UserRole): Observable<any> {
  //   const userProfile = this.userService.currentUserProfileData();
  //
  //   if (!userProfile?.structureId) {
  //     this.notification.displayNotification(
  //       'Aucune structure associée à votre compte.',
  //       'error'
  //     );
  //     return of(null);
  //   }
  //
  //   // Création du DTO pour l'API
  //   const linkUserDto = {
  //     email: email,
  //     role: role,
  //     structureId: userProfile.structureId
  //   };
  //
  //   // Appel à l'API via le UserApiService pour relier l'utilisateur
  //   return this.userService.linkUserToStructure(linkUserDto).pipe(
  //     tap(result => {
  //       if (result) {
  //         this.notification.displayNotification(
  //           'Utilisateur relié à la structure avec succès !',
  //           'valid'
  //         );
  //         // Optionnel : rafraîchir les données de la structure si nécessaire
  //         this.loadUserStructure(true).subscribe();
  //       }
  //     }),
  //     catchError(error => {
  //       this.notification.displayNotification('Impossible de relier l\'utilisateur à la structure.', 'error');
  //       return of(null);
  //     })
  //   );
  // }

  /**
   * Creates a new structure.
   * En mode mock : déconnecte l'utilisateur après création pour forcer une reconnexion.
   * En mode réel : met à jour le token normalement.
   * @param structureCreationData - The DTO for creating the structure.
   * @returns An Observable of the created `StructureModel` or `undefined` on error.
   */
  createStructure(structureCreationData: StructureCreationDto): Observable<StructureModel | undefined> {
    return this.structureApi.createStructure(structureCreationData).pipe(
      tap((response: StructureCreationResponseDto) => {
        if (response.createdStructure) {
          const structureId = response.createdStructure.id;

          if (response.newToken) {
            // En mode réel, utiliser le token fourni par l'API
            this.authService.updateTokenAndState(response.newToken);
            this.notification.displayNotification('Structure créée avec succès !', 'valid');
          }

          // Mise à jour de l'état local
          const newStructure = response.createdStructure as StructureModel;
          this.userStructureSig.set(newStructure);

          // Initialize areas
          if (structureId) {
            this.loadUserStructureAreas(true).subscribe();
          }

        } else {
          this.notification.displayNotification(
            'Structure créée, mais les détails n\'ont pas pu être récupérés immédiatement.',
            'warning'
          );
        }
      }),
      map(response => response.createdStructure as StructureModel | undefined),
      catchError(error => {
        this.handleError('Impossible de créer la structure.', error);
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
    return this.structureApi.deleteStructure(structureId).pipe(
      map(() => true), // API returns void, map to true for success
      tap(() => {
        if (this.userStructureSig()?.id === structureId) {
          this.userStructureSig.set(null);
          this.userStructureAreasSig.set([]);
        }
        this.notification.displayNotification('Structure supprimée avec succès.', 'valid');
      }),
      catchError(error => {
        this.handleError('Impossible de supprimer la structure.', error);
        return of(false);
      })
    );
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
  uploadStructureImage(structureId: number, file: File, type: 'logo' | 'cover'): Observable<{ fileName: string; fileUrl: string; message: string }> {
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
            return { ...area, audienceZoneTemplates: templates };
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
