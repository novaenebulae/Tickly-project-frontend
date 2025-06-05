import {Injectable} from '@angular/core';


import {inject, signal, computed, WritableSignal, effect, untracked} from '@angular/core';
import {UserService} from '../user/user.service';
import {StructureService} from '../structure/structure.service';
import {AuthService} from '../user/auth.service';
import {NotificationService} from '../utilities/notification.service';
import {StructureModel} from '../../../models/structure/structure.model';
import {Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {StructureAreaModel} from '../../../models/structure/structure-area.model';
import {EventModel} from '../../../models/event/event.model';
import {EventService} from '../event/event.service';


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
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  // Signal pour la structure de l'utilisateur
  private userStructureSig: WritableSignal<StructureModel | null | undefined> = signal(undefined);
  public readonly userStructure = computed(() => this.userStructureSig());

  private userStructureEventsSig: WritableSignal<EventModel[]> = signal([]);
  public readonly userStructureEvents = computed(() => this.userStructureEventsSig());

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
  getUserStructureEvents(forceRefresh = false): Observable<EventModel[]> {
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

  private refreshStructureEvents(force = true): Observable<EventModel[]> {
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


}
