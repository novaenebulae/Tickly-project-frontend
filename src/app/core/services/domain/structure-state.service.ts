// src/app/core/services/domain/structure-state.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { StructureModel } from '../../models/structure/structure.model';
import { StructureService } from './structure.service';
import { StructureSearchParams } from '../api/structure-api.service';

/**
 * Service de gestion d'état pour les structures
 * Fournit un état réactif pour les structures et leurs filtres
 */
@Injectable({
  providedIn: 'root'
})
export class StructureStateService {
  private structureService = inject(StructureService);

  // Signaux pour l'état
  private structuresSig = signal<StructureModel[]>([]);
  private isLoadingSig = signal<boolean>(false);
  private errorSig = signal<string | null>(null);

  // Signaux pour les filtres
  private filterParamsSig = signal<Partial<StructureSearchParams>>({});
  private totalCountSig = signal<number>(0);
  private paginationSig = signal<{ page: number; pageSize: number }>({ page: 0, pageSize: 10 });

  // Computed signals pour l'interface
  readonly structures = computed(() => this.structuresSig());
  readonly isLoading = computed(() => this.isLoadingSig());
  readonly error = computed(() => this.errorSig());
  readonly filterParams = computed(() => this.filterParamsSig());
  readonly totalCount = computed(() => this.totalCountSig());
  readonly pagination = computed(() => this.paginationSig());

  /**
   * Charge les structures avec les filtres actuels
   * @param resetPagination Réinitialise la pagination si true
   */
  loadStructures(resetPagination: boolean = false): Observable<StructureModel[]> {
    this.isLoadingSig.set(true);
    this.errorSig.set(null);

    if (resetPagination) {
      this.setPagination({ page: 0, pageSize: this.paginationSig().pageSize });
    }

    // Combine les filtres et la pagination
    const params: Partial<StructureSearchParams> = {
      ...this.filterParamsSig(),
      page: this.paginationSig().page,
      pageSize: this.paginationSig().pageSize
    };

    return this.structureService.getStructures(params).pipe(
      tap(structures => {
        this.structuresSig.set(structures);
        this.totalCountSig.set(structures.length); // Note: Dans un cas réel avec pagination par API, ce nombre viendrait de l'API
        this.isLoadingSig.set(false);
      }),
      map(() => this.structuresSig()),
      tap({
        error: err => {
          this.errorSig.set(err?.message || 'Erreur lors du chargement des structures');
          this.isLoadingSig.set(false);
        }
      })
    );
  }

  /**
   * Recherche des structures par terme de recherche
   * @param query Terme de recherche
   */
  searchStructures(query: string | undefined): void {
    const currentParams = this.filterParamsSig();
    this.setFilterParams({ ...currentParams, query });
    this.loadStructures(true).subscribe();
  }

  /**
   * Définit les paramètres de filtrage
   * @param params Nouveaux paramètres de filtrage
   */
  setFilterParams(params: Partial<StructureSearchParams>): void {
    this.filterParamsSig.set(params);
  }

  /**
   * Met à jour partiellement les paramètres de filtrage
   * @param params Paramètres de filtrage à mettre à jour
   */
  updateFilterParams(params: Partial<StructureSearchParams>): void {
    this.filterParamsSig.update(current => ({ ...current, ...params }));
  }

  /**
   * Filtre les structures par type
   * @param typeIds IDs des types à filtrer
   */
  filterByTypes(typeIds: number[] | undefined): void {
    this.updateFilterParams({ types: typeIds });
    this.loadStructures(true).subscribe();
  }

  /**
   * Filtre les structures par localisation
   * @param location Terme de localisation (ville, pays, code postal, rue)
   */
  filterByLocation(location: string | undefined): void {
    this.updateFilterParams({ location });
    this.loadStructures(true).subscribe();
  }

  /**
   * Filtre les structures par importance minimale
   * @param minImportance Valeur minimale d'importance
   */
  filterByMinImportance(minImportance: number | undefined): void {
    this.updateFilterParams({ minImportance });
    this.loadStructures(true).subscribe();
  }

  /**
   * Trie les structures
   * @param sortBy Champ de tri
   * @param sortDirection Direction du tri ('asc' ou 'desc')
   */
  sortStructures(sortBy: string, sortDirection: 'asc' | 'desc' = 'asc'): void {
    this.updateFilterParams({ sortBy, sortDirection });
    this.loadStructures(false).subscribe();
  }

  /**
   * Définit les paramètres de pagination
   * @param pagination Nouveaux paramètres de pagination
   */
  setPagination(pagination: { page: number; pageSize: number }): void {
    this.paginationSig.set(pagination);
  }

  /**
   * Change de page
   * @param page Nouvelle page
   */
  goToPage(page: number): void {
    if (page < 0) return;

    this.setPagination({
      page,
      pageSize: this.paginationSig().pageSize
    });

    this.loadStructures(false).subscribe();
  }

  /**
   * Change la taille de page
   * @param pageSize Nouvelle taille de page
   */
  setPageSize(pageSize: number): void {
    if (pageSize < 1) return;

    this.setPagination({
      page: 0, // Retour à la première page lors du changement de taille
      pageSize
    });

    this.loadStructures(false).subscribe();
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.setFilterParams({});
    this.setPagination({ page: 0, pageSize: this.paginationSig().pageSize });
    this.loadStructures(false).subscribe();
  }

  /**
   * Filtre les structures localement (sans appel API)
   * Utile pour les filtres rapides côté client
   * @param structures Liste des structures à filtrer
   * @param params Paramètres de filtrage
   */
  filterStructuresLocally(structures: StructureModel[], params: Partial<StructureSearchParams>): StructureModel[] {
    let filteredStructures = [...structures];

    // Filtrage par recherche textuelle
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredStructures = filteredStructures.filter(s =>
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
      );
    }

    // Filtrage par types
    const typesToFilter = params.typeIds?.length ? params.typeIds : params.types;
    if (typesToFilter && typesToFilter.length > 0) {
      filteredStructures = filteredStructures.filter(s =>
        s.types.some(t => typesToFilter.includes(t.id))
      );
    }

    // Filtrage par localisation
    if (params.location) {
      const location = params.location.toLowerCase();
      filteredStructures = filteredStructures.filter(s =>
        s.address.city.toLowerCase().includes(location) ||
        s.address.country.toLowerCase().includes(location) ||
        (s.address.zipCode && s.address.zipCode.toLowerCase().includes(location)) ||
        (s.address.street && s.address.street.toLowerCase().includes(location))
      );
    }

    // Filtrage par importance minimale
    if (params.minImportance !== undefined) {
      filteredStructures = filteredStructures.filter(s =>
        (s.importance !== undefined && s.importance >= params.minImportance!)
      );
    }

    // Filtrage par importance maximale
    if (params.maxImportance !== undefined) {
      filteredStructures = filteredStructures.filter(s =>
        (s.importance !== undefined && s.importance <= params.maxImportance!)
      );
    }

    return filteredStructures;
  }

  /**
   * Trie les structures localement (sans appel API)
   * @param structures Liste des structures à trier
   * @param sortBy Champ de tri
   * @param sortDirection Direction du tri ('asc' ou 'desc')
   */
  sortStructuresLocally(
    structures: StructureModel[],
    sortBy: keyof StructureModel | 'city' | 'importance',
    sortDirection: 'asc' | 'desc' = 'asc'
  ): StructureModel[] {
    const direction = sortDirection === 'desc' ? -1 : 1;

    return [...structures].sort((a, b) => {
      let valA: any = undefined;
      let valB: any = undefined;

      // Cas spécial pour trier par ville (qui est dans l'objet address)
      if (sortBy === 'city') {
        valA = a.address.city.toLowerCase();
        valB = b.address.city.toLowerCase();
      }
      // Cas spécial pour trier par importance (gérer les undefined)
      else if (sortBy === 'importance') {
        valA = a.importance !== undefined ? a.importance : 0;
        valB = b.importance !== undefined ? b.importance : 0;
      }
      else {
        valA = a[sortBy as keyof StructureModel];
        valB = b[sortBy as keyof StructureModel];

        // Traitement pour les chaînes de caractères (ignorer casse)
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
        }
        if (typeof valB === 'string') {
          valB = valB.toLowerCase();
        }

        // Traitement pour les dates
        if (valA instanceof Date && valB instanceof Date) {
          return ((valA as Date).getTime() - (valB as Date).getTime()) * direction;
        }
      }

      // Gestion des valeurs undefined ou null
      if (valA === undefined || valA === null) return 1 * direction;
      if (valB === undefined || valB === null) return -1 * direction;

      // Comparaison standard
      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
  }

  /**
   * Récupère les structures les plus importantes
   * @param count Nombre de structures à récupérer
   */
  getMostImportantStructures(count: number = 5): Observable<StructureModel[]> {
    return this.structureService.getMostImportantStructures(count);
  }
}
