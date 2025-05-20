// src/app/core/services/domain/category.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of, map, tap, catchError } from 'rxjs';
import { EventCategoryModel } from '../../models/event/event-category.model';
import { EventApiService } from '../api/event-api.service';
import { mockCategories } from '../../mocks/events/categories.mock';

/**
 * Service de gestion des catégories d'événements
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private eventApi = inject(EventApiService);

  // Cache des catégories
  private categoriesCache = new BehaviorSubject<EventCategoryModel[]>([]);
  categories$ = this.categoriesCache.asObservable();

  // Indicateur de chargement
  private loadingCategories = new BehaviorSubject<boolean>(false);
  loadingCategories$ = this.loadingCategories.asObservable();

  constructor() {
    // Charger les catégories au démarrage du service
    this.loadCategories();
  }

  /**
   * Charge les catégories depuis l'API
   */
  loadCategories(): Observable<EventCategoryModel[]> {
    this.loadingCategories.next(true);

    return this.eventApi.getEventCategories().pipe(
      tap(categories => {
        this.categoriesCache.next(categories);
        this.loadingCategories.next(false);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.loadingCategories.next(false);

        // Utiliser les catégories mockées en cas d'erreur
        this.categoriesCache.next(mockCategories);
        return of(mockCategories);
      })
    );
  }

  /**
   * Récupère toutes les catégories
   */
  getCategories(): Observable<EventCategoryModel[]> {
    // Si le cache est vide, charger les catégories
    if (this.categoriesCache.value.length === 0) {
      return this.loadCategories();
    }

    // Sinon, retourner le cache
    return this.categories$;
  }

  /**
   * Récupère une catégorie par son ID
   */
  getCategoryById(id: number): EventCategoryModel | undefined {
    const categories = this.categoriesCache.value;

    // Rechercher dans le cache
    const category = categories.find(cat => cat.id === id);
    if (category) {
      return category;
    }

    // Si pas trouvé dans le cache, rechercher dans les mocks
    return mockCategories.find(cat => cat.id === id);
  }

  /**
   * Convertit un ID de catégorie en objet EventCategoryModel
   */
  convertCategoryIdToModel(categoryId: number): EventCategoryModel {
    const category = this.getCategoryById(categoryId);

    if (category) {
      return category;
    }

    // Si la catégorie n'est pas trouvée, créer un modèle par défaut
    return {
      id: categoryId,
      name: `Catégorie #${categoryId}`
    };
  }
}
