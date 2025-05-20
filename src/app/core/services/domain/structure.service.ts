// src/app/core/services/domain/structure.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

// Services
import { NotificationService } from './notification.service';
import { StructureApiService, StructureSearchParams } from '../api/structure-api.service';
import { AuthService } from './auth.service';
import {StructureCreationDto, StructureCreationResponse, StructureModel} from '../../models/structure/structure.model';
import {StructureTypeModel} from '../../models/structure/structure-type.model';
import {AreaModel} from '../../models/structure/area.model';
import {AddressModel} from '../../models/structure/address.model';

// Models


/**
 * Service de gestion des structures
 * Couche métier qui encapsule les appels API et la logique liée aux structures
 */
@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private structureApi = inject(StructureApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);

  // Signaux pour stocker les données en cache
  private structureTypesSig = signal<StructureTypeModel[]>([]);
  private currentStructureSig = signal<StructureModel | null>(null);
  private structureAreasSig = signal<AreaModel[]>([]);

  // Exposer les données en lecture seule
  readonly structureTypes = computed(() => this.structureTypesSig());
  readonly currentStructure = computed(() => this.currentStructureSig());
  readonly structureAreas = computed(() => this.structureAreasSig());

  constructor() {
    // Précharger les types de structures au démarrage
    this.loadStructureTypes();
  }

  /**
   * Crée une nouvelle structure
   * @param structureData Données de la structure à créer
   */
  createStructure(structureData: StructureCreationDto): Observable<StructureCreationResponse> {
    return this.structureApi.createStructure(structureData).pipe(
      tap(response => {
        // Mise à jour du token à partir de la réponse
        if (response.newToken) {
          this.authService.updateTokenAndState(response.newToken);
        }

        // Si la structure a été créée et renvoyée
        if (response.createdStructure) {
          this.currentStructureSig.set(response.createdStructure);
        }

        this.notification.displayNotification(
          'Structure créée avec succès',
          'valid',
          'Fermer'
        );
      }),
      catchError(error => {
        this.handleError('Impossible de créer la structure', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère la structure actuellement gérée par l'utilisateur
   * @param structureId ID de la structure à récupérer
   * @param forceRefresh Force le rechargement même si en cache
   */
  getCurrentStructure(structureId: number, forceRefresh = false): Observable<StructureModel | null> {
    // Si des données sont en cache et qu'on ne force pas le rafraîchissement
    if (!forceRefresh && this.currentStructureSig() && this.currentStructureSig()?.id === structureId) {
      return of(this.currentStructureSig());
    }

    return this.getStructureById(structureId).pipe(
      tap(structure => {
        if (structure) {
          this.currentStructureSig.set(structure);
        }
      })
    );
  }

  /**
   * Récupère toutes les structures avec possibilité de filtrage
   * @param params Paramètres de recherche
   * @param includeImportanceStats Indique si les statistiques d'importance doivent être incluses
   */
  getStructures(
    params: Partial<StructureSearchParams> = {},
    includeImportanceStats: boolean = false
  ): Observable<StructureModel[]> {
    return this.structureApi.getStructures(params, includeImportanceStats).pipe(
      map(structures => {
        // Si on demande un tri par importance mais que ce n'est pas géré par l'API
        if (params.sortBy === 'importance' && !structures.every(s => s.importance !== undefined)) {
          console.warn('Tri par importance demandé mais certaines structures n\'ont pas de score d\'importance');
          // Trier localement au cas où
          return [...structures].sort((a, b) => {
            const importanceA = a.importance !== undefined ? a.importance : 0;
            const importanceB = b.importance !== undefined ? b.importance : 0;
            const direction = params.sortDirection === 'desc' ? -1 : 1;
            return (importanceA - importanceB) * direction;
          });
        }
        return structures;
      }),
      map(structures => {
        // Si on demande un tri par importance mais que ce n'est pas géré par l'API
        if (params.sortBy === 'importance' && !structures.every(s => s.importance !== undefined)) {
          console.warn('Tri par importance demandé mais certaines structures n\'ont pas de score d\'importance');
          // Trier localement au cas où
          return [...structures].sort((a, b) => {
            const importanceA = a.importance !== undefined ? a.importance : 0;
            const importanceB = b.importance !== undefined ? b.importance : 0;
            const direction = params.sortDirection === 'desc' ? -1 : 1;
            return (importanceA - importanceB) * direction;
          });
        }
        return structures;
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer les structures', error);
        return of([]);
      })
    );
  }

  /**
   * Recherche des structures par nom ou autres critères
   * @param query Terme de recherche
   * @param additionalParams Paramètres supplémentaires
   * @param includeImportanceStats Indique si les statistiques d'importance doivent être incluses
   */
  searchStructures(
    query: string,
    additionalParams: Partial<StructureSearchParams> = {},
    includeImportanceStats: boolean = false
  ): Observable<StructureModel[]> {
    return this.structureApi.getStructures({
      query,
      ...additionalParams
    }, includeImportanceStats).pipe(
      catchError(error => {
        this.handleError('Erreur lors de la recherche de structures', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les structures les plus importantes
   * @param count Nombre de structures à récupérer
   */
  getMostImportantStructures(count: number = 5): Observable<StructureModel[]> {
    return this.structureApi.getStructures({
      sortBy: 'importance',
      sortDirection: 'desc',
      pageSize: count,
      page: 0
    }).pipe(
      catchError(error => {
        this.handleError('Erreur lors de la récupération des structures importantes', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère une structure par son ID
   * @param id ID de la structure
   */
  getStructureById(id: number): Observable<StructureModel | null> {
    return this.structureApi.getStructureById(id).pipe(
      map(structure => {
        // Si la structure récupérée est pour l'utilisateur courant, on la met en cache
        const currentUserStructureId = this.authService.currentUser()?.structureId;
        if (currentUserStructureId && currentUserStructureId === id) {
          this.currentStructureSig.set(structure);
        }
        return structure;
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer la structure #${id}`, error);
        return of(null);
      })
    );
  }

  /**
   * Met à jour une structure existante
   * @param id ID de la structure
   * @param structureData Données mises à jour
   */
  updateStructure(id: number, structureData: Partial<StructureModel>): Observable<StructureModel | null> {
    return this.structureApi.updateStructure(id, structureData).pipe(
      tap(updatedStructure => {
        // Mettre à jour le cache si c'est la structure courante
        if (this.currentStructureSig()?.id === id) {
          this.currentStructureSig.set(updatedStructure);
        }

        this.notification.displayNotification(
          'Structure mise à jour avec succès',
          'valid',
          'Fermer'
        );
      }),
      catchError(error => {
        this.handleError('Impossible de mettre à jour la structure', error);
        return of(null);
      })
    );
  }

  /**
   * Supprime une structure
   * @param id ID de la structure à supprimer
   */
  deleteStructure(id: number): Observable<boolean> {
    return this.structureApi.deleteStructure(id).pipe(
      map(() => true),
      tap(() => {
        // Si c'est la structure courante, vider le cache
        if (this.currentStructureSig()?.id === id) {
          this.currentStructureSig.set(null);
          this.structureAreasSig.set([]);
        }

        this.notification.displayNotification(
          'Structure supprimée avec succès',
          'valid',
          'Fermer'
        );
      }),
      catchError(error => {
        this.handleError('Impossible de supprimer la structure', error);
        return of(false);
      })
    );
  }

  /**
   * Récupère tous les types de structures disponibles
   * @param forceRefresh Force le rechargement même si en cache
   */
  getStructureTypes(forceRefresh = false): Observable<StructureTypeModel[]> {
    // Si des données sont en cache et qu'on ne force pas le rafraîchissement
    if (!forceRefresh && this.structureTypesSig().length > 0) {
      return of(this.structureTypesSig());
    }

    return this.loadStructureTypes();
  }

  /**
   * Charge les types de structures depuis l'API
   */
  private loadStructureTypes(): Observable<StructureTypeModel[]> {
    return this.structureApi.getStructureTypes().pipe(
      tap(types => {
        this.structureTypesSig.set(types);
      }),
      catchError(error => {
        this.handleError('Impossible de récupérer les types de structures', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère toutes les zones d'une structure
   * @param structureId ID de la structure
   * @param forceRefresh Force le rechargement même si en cache
   */
  getStructureAreas(structureId: number, forceRefresh = false): Observable<AreaModel[]> {
    // Si c'est la structure courante et que des données sont en cache
    const isCurrent = this.currentStructureSig()?.id === structureId;
    if (!forceRefresh && isCurrent && this.structureAreasSig().length > 0) {
      return of(this.structureAreasSig());
    }

    return this.structureApi.getAreas(structureId).pipe(
      tap(areas => {
        // Si c'est la structure courante, on met en cache
        if (isCurrent) {
          this.structureAreasSig.set(areas);
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer les zones de la structure #${structureId}`, error);
        return of([]);
      })
    );
  }

  /**
   * Crée une nouvelle zone dans une structure
   * @param structureId ID de la structure
   * @param areaData Données de la zone à créer
   */
  createArea(structureId: number, areaData: Omit<AreaModel, 'id' | 'structureId'>): Observable<AreaModel | null> {
    return this.structureApi.createArea(structureId, areaData).pipe(
      tap(newArea => {
        // Si c'est pour la structure courante, mettre à jour le cache
        if (this.currentStructureSig()?.id === structureId) {
          const currentAreas = this.structureAreasSig();
          this.structureAreasSig.set([...currentAreas, newArea]);
        }

        this.notification.displayNotification(
          'Zone créée avec succès',
          'valid',
          'Fermer'
        );
      }),
      catchError(error => {
        this.handleError('Impossible de créer la zone', error);
        return of(null);
      })
    );
  }

  /**
   * Met à jour une zone existante
   * @param structureId ID de la structure
   * @param areaId ID de la zone
   * @param areaData Données mises à jour
   */
  updateArea(structureId: number, areaId: number, areaData: Partial<AreaModel>): Observable<AreaModel | null> {
    return this.structureApi.updateArea(structureId, areaId, areaData).pipe(
      tap(updatedArea => {
        // Si c'est pour la structure courante, mettre à jour le cache
        if (this.currentStructureSig()?.id === structureId) {
          const areas = this.structureAreasSig();
          const updatedAreas = areas.map(area =>
            area.id === areaId ? updatedArea : area
          );
          this.structureAreasSig.set(updatedAreas);
        }

        this.notification.displayNotification(
          'Zone mise à jour avec succès',
          'valid',
          'Fermer'
        );
      }),
      catchError(error => {
        this.handleError('Impossible de mettre à jour la zone', error);
        return of(null);
      })
    );
  }

  /**
   * Supprime une zone
   * @param structureId ID de la structure
   * @param areaId ID de la zone
   */
  deleteArea(structureId: number, areaId: number): Observable<boolean> {
    return this.structureApi.deleteArea(structureId, areaId).pipe(
      map(() => true),
      tap(() => {
        // Si c'est pour la structure courante, mettre à jour le cache
        if (this.currentStructureSig()?.id === structureId) {
          const areas = this.structureAreasSig();
          const filteredAreas = areas.filter(area => area.id !== areaId);
          this.structureAreasSig.set(filteredAreas);
        }

        this.notification.displayNotification(
          'Zone supprimée avec succès',
          'valid',
          'Fermer'
        );
      }),
      catchError(error => {
        this.handleError('Impossible de supprimer la zone', error);
        return of(false);
      })
    );
  }

  /**
   * Crée un modèle d'adresse vide pour initialiser les formulaires
   */
  createEmptyAddress(): AddressModel {
    return {
      country: '',
      city: '',
      street: '',
      zipCode: ''
    };
  }

  /**
   * Gère les erreurs en les journalisant et en affichant une notification
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.notification.displayNotification(
      error.message || message,
      'error',
      'Fermer'
    );
  }
}
