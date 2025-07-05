/**
 * @file Domain service for statistics functionality.
 * This service encapsulates business logic, composes StatisticsApiService for API interactions,
 * and manages state/cache for statistics data.
 * @licence Proprietary
 */

import {computed, inject, Injectable, signal} from '@angular/core';
import {catchError, Observable, of, tap} from 'rxjs';

// API Service
import {StatisticsApiService} from '../../api/statistics/statistics-api.service';

// Models
import {StructureDashboardStatsDto} from '../../../models/statistics/structure-dashboard-stats.model';
import {EventStatisticsDto} from '../../../models/statistics/event-statistics.model';

// Other Domain Services
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';

/**
 * Domain service for statistics functionality.
 * Manages fetching and caching statistics data for structures and events.
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private statisticsApi = inject(StatisticsApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);

  // --- State Management using Signals ---

  // Loading state
  private loadingStructureStatsSig = signal(false);
  private loadingEventStatsSig = signal(false);

  // Structure dashboard statistics
  private structureDashboardStatsSig = signal<StructureDashboardStatsDto | null>(null);

  // Event statistics
  private eventStatisticsSig = signal<EventStatisticsDto | null>(null);
  private currentEventIdSig = signal<number | null>(null);

  // Public computed signals
  public readonly isLoadingStructureStats = computed(() => this.loadingStructureStatsSig());
  public readonly structureDashboardStats = computed(() => this.structureDashboardStatsSig());

  /**
   * Fetches dashboard statistics for the current user's structure.
   * Uses the structure ID from the authentication service.
   * @param forceRefresh - If true, fetches from API even if data is already cached.
   * @returns An Observable of StructureDashboardStatsDto.
   */
  getStructureDashboardStats(forceRefresh = false): Observable<StructureDashboardStatsDto | null> {
    // Get the current user's structure ID
    const structureId = this.authService.userStructureId();

    if (!structureId) {
      this.notification.displayNotification(
        'Vous devez être associé à une structure pour accéder aux statistiques.',
        'warning'
      );
      return of(null);
    }

    // If data is already loaded and refresh is not forced, return cached data
    if (!forceRefresh && this.structureDashboardStatsSig() !== null) {
      return of(this.structureDashboardStatsSig());
    }

    // Set loading state
    this.loadingStructureStatsSig.set(true);

    return this.statisticsApi.getStructureDashboardStats(structureId).pipe(
      tap(stats => {
        // Update state with fetched data
        this.structureDashboardStatsSig.set(stats);
        this.loadingStructureStatsSig.set(false);
      }),
      catchError(error => {
        this.loadingStructureStatsSig.set(false);
        this.handleError('Impossible de récupérer les statistiques de la structure.', error);
        return of(null);
      })
    );
  }

  /**
   * Fetches statistics for a specific event.
   * @param eventId - The ID of the event to get statistics for.
   * @param forceRefresh - If true, fetches from API even if data is already cached for this event.
   * @returns An Observable of EventStatisticsDto.
   */
  getEventStatistics(eventId: number, forceRefresh = false): Observable<EventStatisticsDto | null> {
    // If data is already loaded for this event and refresh is not forced, return cached data
    if (!forceRefresh && this.currentEventIdSig() === eventId && this.eventStatisticsSig() !== null) {
      return of(this.eventStatisticsSig());
    }

    // Set loading state and current event ID
    this.loadingEventStatsSig.set(true);
    this.currentEventIdSig.set(eventId);

    return this.statisticsApi.getEventStatistics(eventId).pipe(
      tap(stats => {
        // Update state with fetched data
        this.eventStatisticsSig.set(stats);
        this.loadingEventStatsSig.set(false);
      }),
      catchError(error => {
        this.loadingEventStatsSig.set(false);
        this.handleError(`Impossible de récupérer les statistiques de l'événement #${eventId}.`, error);
        return of(null);
      })
    );
  }

  /**
   * Centralized error handler for statistics-related operations.
   * Logs the error and displays a notification.
   * @param message - The user-facing message to display.
   * @param error - The error object from the API call.
   */
  private handleError(message: string, error: any): void {
    console.error(`StatisticsService Error: ${message}`, error);
    this.notification.displayNotification(
      error.message || message,
      'error'
    );
  }
}
