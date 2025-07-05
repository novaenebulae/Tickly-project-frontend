/**
 * @file Domain service for managing event categories.
 * This service fetches, caches, and provides access to event categories.
 * It composes EventApiService for API interactions.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map, shareReplay, tap} from 'rxjs/operators';

import {EventCategoryModel} from '../../../models/event/event-category.model';
import {EventApiService} from '../../api/event/event-api.service';
import {NotificationService} from '../utilities/notification.service'; // Optional, if notifications needed

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private eventApi = inject(EventApiService);
  private notification = inject(NotificationService); // Optional, for error notifications

  // --- State Management using Signals ---
  private categoriesSig: WritableSignal<EventCategoryModel[]> = signal([]);
  /**
   * A signal that emits the current array of cached event categories.
   * Components can subscribe to this to react to category list changes.
   */
  public readonly categories = computed(() => this.categoriesSig());

  private isLoadingSig: WritableSignal<boolean> = signal(false);
  /**
   * A signal indicating whether categories are currently being loaded from the API.
   */
  public readonly isLoading = computed(() => this.isLoadingSig());

  // Observable for the initial load, shared and replayed
  private loadCategories$: Observable<EventCategoryModel[]>;

  constructor() {
    // Initiate loading of categories upon service instantiation and cache the result.
    // shareReplay ensures the API is called only once even with multiple initial subscribers.
    this.loadCategories$ = this.fetchCategoriesFromApi().pipe(
      shareReplay(1) // Cache the last emitted value and replay for new subscribers
    );
    this.loadCategories().subscribe(); // Trigger initial load
  }

  /**
   * Fetches categories from the API, updates the signal, and handles errors.
   * This is the private method that performs the actual API call.
   * @returns An Observable of `EventCategoryModel[]`.
   */
  private fetchCategoriesFromApi(): Observable<EventCategoryModel[]> {
    this.isLoadingSig.set(true);
    return this.eventApi.getEventCategories().pipe( // EventApiService returns Observable<any[]>
      map((apiCategories: any[]): EventCategoryModel[] => {
        // Assuming API returns objects that directly map to EventCategoryModel
        // If transformation is needed (e.g., renaming fields), do it here.
        if (!apiCategories || !Array.isArray(apiCategories)) {
          console.warn('CategoryService: API did not return a valid array for categories.');
          return [];
        }
        return apiCategories.map(cat => ({
          id: cat.id,
          name: cat.name
        } as EventCategoryModel));
      }),
      tap(categories => {
        this.categoriesSig.set(categories);
        this.isLoadingSig.set(false);
      }),
      catchError(error => {
        console.error('CategoryService: Error loading categories from API:', error.originalError || error);
        this.notification.displayNotification(
          error.message || "Erreur lors du chargement des catégories d'événements.", // French message
          'error'
        );
        this.isLoadingSig.set(false);
        return of(); // Return mockCategories as an Observable
      })
    );
  }

  /**
   * Public method to ensure categories are loaded and get them.
   * If categories are already loaded (signal has data), it returns them as an Observable.
   * Otherwise, it triggers `fetchCategoriesFromApi` via the shared `loadCategories$`.
   * @param forceRefresh - If true, forces a refetch from the API.
   * @returns An Observable of `EventCategoryModel[]`.
   */
  loadCategories(forceRefresh = false): Observable<EventCategoryModel[]> {
    if (forceRefresh) {
      // Re-assign loadCategories$ to trigger a new fetch for all subscribers
      this.loadCategories$ = this.fetchCategoriesFromApi().pipe(shareReplay(1));
    } else if (this.categoriesSig().length > 0 && !this.isLoadingSig()) {
      // If categories are already in the signal and not currently loading, return them.
      return of(this.categoriesSig());
    }
    // Return the shared observable (either existing or new if forceRefresh was true)
    return this.loadCategories$;
  }

}
