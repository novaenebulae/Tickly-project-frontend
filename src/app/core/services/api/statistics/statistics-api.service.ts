/**
 * @file Service for API communication with statistics endpoints.
 * @licence Proprietary
 */

import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {ApiConfigService} from '../api-config.service';
import {StructureDashboardStatsDto} from '../../../models/statistics/structure-dashboard-stats.model';
import {EventStatisticsDto} from '../../../models/statistics/event-statistics.model';
import {APP_CONFIG} from '../../../config/app-config'; // Adjusted path

/**
 * Service for API communication with statistics endpoints.
 * Handles fetching structure dashboard statistics and event-specific statistics.
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticsApiService {
  private apiConfig = inject(ApiConfigService);

  /**
   * Fetches dashboard statistics for a specific structure.
   * @param structureId - The ID of the structure to get statistics for.
   * @returns An Observable of StructureDashboardStatsDto.
   */
  getStructureDashboardStats(structureId: number): Observable<StructureDashboardStatsDto> {
    // Check if mocks are enabled for statistics domain
    if (this.apiConfig.isMockEnabledForDomain('statistics')) {
      return this.getMockStructureDashboardStats(structureId);
    }

    const endpoint = APP_CONFIG.api.endpoints.statistics.structureDashboard(structureId);
    const url = this.apiConfig.getUrl(endpoint);
    this.apiConfig.logApiRequest('GET', url);

    return this.apiConfig.http.get<StructureDashboardStatsDto>(
      url,
      { headers: this.apiConfig.createHeaders() }
    ).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', url, response)),
      catchError(error => {
        this.apiConfig.logApiError('GET', url, error);
        throw error;
      })
    );
  }

  /**
   * Fetches statistics for a specific event.
   * @param eventId - The ID of the event to get statistics for.
   * @returns An Observable of EventStatisticsDto.
   */
  getEventStatistics(eventId: number): Observable<EventStatisticsDto> {
    // Check if mocks are enabled for statistics domain
    if (this.apiConfig.isMockEnabledForDomain('statistics')) {
      return this.getMockEventStatistics(eventId);
    }

    const endpoint = APP_CONFIG.api.endpoints.statistics.eventStatistics(eventId);
    const url = this.apiConfig.getUrl(endpoint);

    this.apiConfig.logApiRequest('GET', url);

    return this.apiConfig.http.get<EventStatisticsDto>(
      url,
      { headers: this.apiConfig.createHeaders() }
    ).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', url, response)),
      catchError(error => {
        this.apiConfig.logApiError('GET', url, error);
        throw error;
      })
    );
  }

  /**
   * Provides mock data for structure dashboard statistics.
   * @param structureId - The ID of the structure to get mock statistics for.
   * @returns An Observable of StructureDashboardStatsDto with mock data.
   */
  private getMockStructureDashboardStats(structureId: number): Observable<StructureDashboardStatsDto> {
    // Create mock data based on the example in the documentation
    const mockData: StructureDashboardStatsDto = {
      upcomingEventsCount: 11,
      totalTicketsReserved: 365,
      totalExpectedAttendees: 265,
      averageAttendanceRate: 0,
      topEventsChart: {
        chartType: "bar",
        labels: [
          "Scène Ouverte Poésie & Slam",
          "Nuit du Blues & Soul"
        ],
        datasets: [
          {
            label: "Tickets Sold",
            data: [
              225,
              140
            ],
            backgroundColor: [
              "#FF6384",
              "#36A2EB"
            ],
            borderColor: "#FFFFFF",
            fill: false
          }
        ]
      },
      attendanceByCategoryChart: {
        chartType: "doughnut",
        labels: [
          "Humour",
          "Théâtre",
          "Concert",
          "Festival"
        ],
        datasets: [
          {
            label: "Attendees",
            data: [
              225,
              225,
              140,
              140
            ],
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0"
            ],
            borderColor: "#FFFFFF",
            fill: false
          }
        ]
      }
    };

    return this.apiConfig.createMockResponse(mockData);
  }

  /**
   * Provides mock data for event statistics.
   * @param eventId - The ID of the event to get mock statistics for.
   * @returns An Observable of EventStatisticsDto with mock data.
   */
  private getMockEventStatistics(eventId: number): Observable<EventStatisticsDto> {
    // Create mock data based on the example in the documentation
    const mockData: EventStatisticsDto = {
      eventId: eventId,
      eventName: eventId === 20 ? "Nuit du Blues & Soul" : `Event ${eventId}`,
      fillPercentage: 75,
      uniqueReservationAmount: 57,
      attributedTicketsAmount: 120,
      scannedTicketsNumber: 0,
      zoneFillRateChart: {
        chartType: "bar",
        labels: [
          "Placement libre Caveau"
        ],
        datasets: [
          {
            label: "Fill Rate (%)",
            data: [
              70
            ],
            backgroundColor: [
              "#FF6384"
            ],
            borderColor: "#FF6384",
            fill: false
          },
          {
            label: "Capacity",
            data: [
              200
            ],
            backgroundColor: [
              "#36A2EB"
            ],
            borderColor: "#36A2EB",
            fill: false
          },
          {
            label: "Tickets Sold",
            data: [
              140
            ],
            backgroundColor: [
              "#FFCE56"
            ],
            borderColor: "#FFCE56",
            fill: false
          }
        ]
      },
      reservationsOverTimeChart: {
        chartType: "line",
        labels: [
          "2025-06-15",
          "2025-06-17"
        ],
        datasets: [
          {
            label: "Reservations",
            data: [
              100,
              40
            ],
            backgroundColor: [
              "rgba(54, 162, 235, 0.2)"
            ],
            borderColor: "rgba(54, 162, 235, 1)",
            fill: true
          }
        ]
      },
      ticketStatusChart: {
        chartType: "doughnut",
        labels: [
          "USED",
          "VALID",
          "CANCELLED"
        ],
        datasets: [
          {
            label: "Tickets",
            data: [
              100,
              40,
              10
            ],
            backgroundColor: [
              "#36A2EB",
              "#4BC0C0",
              "#FF6384"
            ],
            borderColor: "#FFFFFF",
            fill: false
          }
        ]
      }
    };

    return this.apiConfig.createMockResponse(mockData);
  }
}
