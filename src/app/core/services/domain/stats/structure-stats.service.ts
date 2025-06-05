import {computed, inject, Injectable, signal} from "@angular/core";
import {StatsApiService} from "../../api/stats/stats-api.service";
import {EventsFilterStatsModel, EventsOverviewStatsModel } from "../../../models/stats/dependances/event-performance-snapshot.model";
import {BehaviorSubject, combineLatest, map, Observable, of} from "rxjs";
import {EventsOverviewStatsRequestDto, StructureStatsRequestDto } from "../../../models/stats/dtos/structure-stats-request-dto.model";
import { NotificationService } from "../utilities/notification.service";
import {catchError, finalize, tap} from 'rxjs/operators';
import {StructureStatsModel} from '../../../models/stats/structure/structure-global-stats.model';


@Injectable({
  providedIn: 'root'
})
export class StructureStatsService {
  private statsApi = inject(StatsApiService);
  private notification = inject(NotificationService);

  // ===== STATE MANAGEMENT =====

  // Signal pour les statistiques de la structure actuellement sélectionnée
  private currentStructureStatsSig = signal<StructureStatsModel | null>(null);
  public readonly currentStructureStats = computed(() => this.currentStructureStatsSig());

  // Signal pour l'overview des événements de la structure
  private currentEventsOverviewSig = signal<EventsOverviewStatsModel | null>(null);
  public readonly currentEventsOverview = computed(() => this.currentEventsOverviewSig());

  // Signal pour les données du dashboard consolidé
  private currentDashboardSig = signal<any>(null);
  public readonly currentDashboard = computed(() => this.currentDashboardSig());

  // Signal pour l'état de chargement
  private loadingStatsSig = signal<boolean>(false);
  public readonly isLoadingStats = computed(() => this.loadingStatsSig());

  // Signal pour la structure actuellement suivie
  private currentStructureIdSig = signal<number | null>(null);
  public readonly currentStructureId = computed(() => this.currentStructureIdSig());

  // Cache pour les données filtrées
  private filteredStatsSubject = new BehaviorSubject<EventsFilterStatsModel | null>(null);
  public readonly filteredStats$ = this.filteredStatsSubject.asObservable();

  // ===== MÉTHODES PUBLIQUES =====

  /**
   * Charge les statistiques complètes d'une structure
   * @param structureId - ID de la structure
   * @param params - Paramètres optionnels de requête
   * @param forceRefresh - Force le rechargement
   * @returns Observable<StructureStatsModel>
   */
  loadStructureStats(structureId: number, params?: Partial<StructureStatsRequestDto>, forceRefresh = false): Observable<StructureStatsModel> {
    // Cache check
    if (!forceRefresh && this.currentStructureIdSig() === structureId && this.currentStructureStatsSig()) {
      return of(this.currentStructureStatsSig()!);
    }

    this.loadingStatsSig.set(true);
    this.currentStructureIdSig.set(structureId);

    return this.statsApi.getStructureStats(structureId, params).pipe(
      tap(stats => {
        this.currentStructureStatsSig.set(stats);
        console.log(`[StructureStatsService] Stats loaded for structure ${structureId}:`, stats);
      }),
      catchError(error => {
        console.error(`[StructureStatsService] Error loading stats for structure ${structureId}:`, error);
        this.notification.displayNotification('Erreur lors du chargement des statistiques de la structure', 'error');
        this.currentStructureStatsSig.set(null);
        throw error;
      }),
      finalize(() => this.loadingStatsSig.set(false))
    );
  }

  /**
   * Charge l'overview des événements d'une structure
   * @param structureId - ID de la structure
   * @param params - Paramètres optionnels
   * @returns Observable<EventsOverviewStatsModel>
   */
  loadEventsOverview(structureId: number, params?: EventsOverviewStatsRequestDto): Observable<EventsOverviewStatsModel> {
    this.loadingStatsSig.set(true);

    return this.statsApi.getEventsOverviewStats(structureId, params).pipe(
      tap(overview => {
        this.currentEventsOverviewSig.set(overview);
        console.log(`[StructureStatsService] Events overview loaded for structure ${structureId}:`, overview);
      }),
      catchError(error => {
        console.error(`[StructureStatsService] Error loading events overview for structure ${structureId}:`, error);
        this.notification.displayNotification('Erreur lors du chargement de l\'aperçu des événements', 'error');
        this.currentEventsOverviewSig.set(null);
        throw error;
      }),
      finalize(() => this.loadingStatsSig.set(false))
    );
  }

  /**
   * Charge le dashboard consolidé d'une structure
   * @param structureId - ID de la structure
   * @returns Observable contenant toutes les données du dashboard
   */
  loadStructureDashboard(structureId: number): Observable<any> {
    this.loadingStatsSig.set(true);
    this.currentStructureIdSig.set(structureId);

    return this.statsApi.getStructureDashboard(structureId).pipe(
      tap(dashboard => {
        this.currentDashboardSig.set(dashboard);
        // Mettre à jour les signaux individuels depuis le dashboard
        if (dashboard.structureStats) {
          this.currentStructureStatsSig.set(dashboard.structureStats);
        }
        if (dashboard.eventsOverview) {
          this.currentEventsOverviewSig.set(dashboard.eventsOverview);
        }
        console.log(`[StructureStatsService] Dashboard loaded for structure ${structureId}:`, dashboard);
      }),
      catchError(error => {
        console.error(`[StructureStatsService] Error loading dashboard for structure ${structureId}:`, error);
        this.notification.displayNotification('Erreur lors du chargement du tableau de bord', 'error');
        this.currentDashboardSig.set(null);
        throw error;
      }),
      finalize(() => this.loadingStatsSig.set(false))
    );
  }

  /**
   * Charge les analytics complètes (stats + overview) d'une structure
   * @param structureId - ID de la structure
   * @param params - Paramètres optionnels
   * @returns Observable contenant stats et overview
   */
  loadCompleteStructureAnalytics(structureId: number, params?: Partial<StructureStatsRequestDto>): Observable<{stats: StructureStatsModel, overview: EventsOverviewStatsModel}> {
    this.loadingStatsSig.set(true);
    this.currentStructureIdSig.set(structureId);

    const stats$ = this.statsApi.getStructureStats(structureId, params);
    const overview$ = this.statsApi.getEventsOverviewStats(structureId);

    return combineLatest([stats$, overview$]).pipe(
      map(([stats, overview]) => ({ stats, overview })),
      tap(({ stats, overview }) => {
        this.currentStructureStatsSig.set(stats);
        this.currentEventsOverviewSig.set(overview);
        console.log(`[StructureStatsService] Complete analytics loaded for structure ${structureId}`);
      }),
      catchError(error => {
        console.error(`[StructureStatsService] Error loading complete analytics for structure ${structureId}:`, error);
        this.notification.displayNotification('Erreur lors du chargement des analyses complètes', error);
        throw error;
      }),
      finalize(() => this.loadingStatsSig.set(false))
    );
  }

  // /**
  //  * Applique des filtres aux événements et récupère les stats filtrées
  //  * @param structureId - ID de la structure
  //  * @param filters - Filtres à appliquer
  //  * @returns Observable<EventsFilterStatsModel>
  //  */
  // applyEventsFilters(structureId: number, filters: EventsFilterStatsModel): Observable<EventsFilterStatsModel> {
  //   this.loadingStatsSig.set(true);
  //
  //   // Ici vous pourriez avoir un endpoint spécifique pour les stats filtrées
  //   // Pour l'instant, on utilise une méthode mock dans le service API
  //
  //   return of(null).pipe( // Remplacez par l'appel API réel
  //     tap(filteredStats => {
  //       this.filteredStatsSubject.next(filteredStats);
  //       console.log(`[StructureStatsService] Filtered stats loaded for structure ${structureId}:`, filteredStats);
  //     }),
  //     catchError(error => {
  //       console.error(`[StructureStatsService] Error loading filtered stats:`, error);
  //       this.notification.displayNotification('Erreur lors de l\'application des filtres', 'error');
  //       throw error;
  //     }),
  //     finalize(() => this.loadingStatsSig.set(false))
  //   );
  // }

  /**
   * Rafraîchit les données de la structure actuellement sélectionnée
   */
  refreshCurrentStructureStats(): Observable<StructureStatsModel | null> {
    const currentStructureId = this.currentStructureIdSig();
    if (!currentStructureId) {
      return of(null);
    }

    return this.loadStructureStats(currentStructureId, undefined, true);
  }

  /**
   * Nettoie le cache et reset l'état
   */
  clearCache(): void {
    this.currentStructureStatsSig.set(null);
    this.currentEventsOverviewSig.set(null);
    this.currentDashboardSig.set(null);
    this.currentStructureIdSig.set(null);
    this.filteredStatsSubject.next(null);
    console.log('[StructureStatsService] Cache cleared');
  }

  /**
   * Sélectionne une structure pour le suivi des statistiques
   * @param structureId - ID de la structure à suivre
   */
  selectStructure(structureId: number): void {
    if (this.currentStructureIdSig() !== structureId) {
      this.currentStructureIdSig.set(structureId);
      // Optionnel : charger automatiquement les stats de base
      this.loadStructureStats(structureId).subscribe();
    }
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Formate les KPIs principaux de la structure
   * @param stats - Statistiques de structure
   * @returns KPIs formatés pour l'affichage
   */
  getMainKPIs(stats: StructureStatsModel | null): any[] {
    if (!stats) return [];

    return [
      {
        label: 'Événements créés',
        value: stats.totalEventsCreated,
        unit: '',
        trend: stats.growthTrends?.eventCreation,
        icon: 'calendar',
        color: 'blue'
      },
      {
        label: 'Billets vendus',
        value: stats.totalTicketsSold,
        unit: '',
        trend: stats.growthTrends?.attendance,
        icon: 'ticket',
        color: 'green'
      },
      {
        label: 'Taux de remplissage moyen',
        value: stats.averageFillRate,
        unit: '%',
        trend: stats.performanceVsPreviousYear,
        icon: 'trending-up',
        color: this.getFillRateColor(stats.averageFillRate)
      },
      {
        label: 'Participants uniques',
        value: stats.audienceInsights?.totalUniqueAttendees || 0,
        unit: '',
        trend: null,
        icon: 'users',
        color: 'purple'
      }
    ];
  }

  /**
   * Génère les données pour les graphiques de performance mensuelle
   * @param stats - Statistiques de structure
   * @returns Données formatées pour Chart.js
   */
  getMonthlyPerformanceChartData(stats: StructureStatsModel | null): any {
    if (!stats?.performanceByMonth?.length) return null;

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    return {
      labels: stats.performanceByMonth.map(p => `${monthNames[p.month - 1]} ${p.year}`),
      datasets: [
        {
          label: 'Taux de remplissage (%)',
          data: stats.performanceByMonth.map(p => p.fillRate),
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F630',
          type: 'line',
          yAxisID: 'y'
        },
        {
          label: 'Nombre d\'événements',
          data: stats.performanceByMonth.map(p => p.eventsCount),
          backgroundColor: '#10B981',
          type: 'bar',
          yAxisID: 'y1'
        }
      ]
    };
  }

  /**
   * Génère les données pour le graphique de performance par catégorie
   * @param stats - Statistiques de structure
   * @returns Données formatées pour Chart.js (doughnut/pie)
   */
  getCategoryPerformanceChartData(stats: StructureStatsModel | null): any {
    if (!stats?.performanceByCategory?.length) return null;

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    return {
      labels: stats.performanceByCategory.map(c => c.categoryName),
      datasets: [
        {
          label: 'Billets vendus',
          data: stats.performanceByCategory.map(c => c.totalTickets),
          backgroundColor: colors.slice(0, stats.performanceByCategory.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  }

  /**
   * Formate les insights sur l'audience
   * @param stats - Statistiques de structure
   * @returns Insights formatés
   */
  getAudienceInsights(stats: StructureStatsModel | null): any {
    if (!stats?.audienceInsights) return null;

    return {
      totalAttendees: {
        value: stats.audienceInsights.totalUniqueAttendees,
        formatted: `${stats.audienceInsights.totalUniqueAttendees.toLocaleString()} participants uniques`
      },
      loyaltyRate: {
        value: stats.audienceInsights.returningCustomersRate,
        formatted: `${stats.audienceInsights.returningCustomersRate}% de fidélité`
      },
      avgTicketsPerCustomer: {
        value: stats.audienceInsights.averageTicketsPerCustomer,
        formatted: `${stats.audienceInsights.averageTicketsPerCustomer} billets/client en moyenne`
      },
      ageDistribution: stats.audienceInsights.ageDistribution
    };
  }

  /**
   * Calcule les alertes et recommandations basées sur les données
   * @param stats - Statistiques de structure
   * @param overview - Overview des événements
   * @returns Liste d'alertes et recommandations
   */
  getAlertsAndRecommendations(stats: StructureStatsModel | null, overview: EventsOverviewStatsModel | null): any[] {
    const alerts: any[] = [];

    if (stats) {
      // Alerte taux de remplissage faible
      if (stats.averageFillRate < 50) {
        alerts.push({
          type: 'warning',
          title: 'Taux de remplissage faible',
          message: `Votre taux de remplissage moyen est de ${stats.averageFillRate}%. Considérez réviser votre stratégie de promotion.`,
          priority: 'high',
          action: 'Voir les recommandations marketing'
        });
      }

      // Alerte tendance négative
      if (stats.performanceVsPreviousYear?.direction === 'down' && stats.performanceVsPreviousYear.percentage > 10) {
        alerts.push({
          type: 'danger',
          title: 'Baisse de performance',
          message: `Performance en baisse de ${stats.performanceVsPreviousYear.percentage}% par rapport à l'année précédente.`,
          priority: 'high',
          action: 'Analyser les causes'
        });
      }

      // Recommandation fidélisation
      if (stats.audienceInsights && stats.audienceInsights.returningCustomersRate < 25) {
        alerts.push({
          type: 'info',
          title: 'Opportunité de fidélisation',
          message: `Seulement ${stats.audienceInsights.returningCustomersRate}% de clients récurrents. Mettez en place un programme de fidélité.`,
          priority: 'medium',
          action: 'Créer un programme de fidélité'
        });
      }
    }

    if (overview) {
      // Alerte événements en brouillon
      if (overview.draftEvents > overview.publishedEvents * 0.5) {
        alerts.push({
          type: 'warning',
          title: 'Nombreux événements en brouillon',
          message: `${overview.draftEvents} événements en brouillon. Pensez à les publier pour augmenter vos ventes.`,
          priority: 'medium',
          action: 'Publier les événements'
        });
      }
    }

    return alerts.sort((a, b) => {
      const priorityOrder: { [key: string]: number } = {'high': 3, 'medium': 2, 'low': 1};
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  }

  private getFillRateColor(fillRate: number): string {
    if (fillRate >= 80) return 'green';
    if (fillRate >= 60) return 'blue';
    if (fillRate >= 40) return 'yellow';
    return 'red';
  }
}
