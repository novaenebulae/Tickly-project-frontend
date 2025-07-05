/**
 * @file Model for structure dashboard statistics.
 * @licence Proprietary
 */

import {ChartJsDataDto} from './chart-js-data.model';

/**
 * Represents the main DTO for the structure-level dashboard.
 * Contains all KPIs and global charts for a structure.
 */
export interface StructureDashboardStatsDto {
  /** Number of upcoming events for the structure */
  upcomingEventsCount: number;

  /** Total number of tickets reserved across all events */
  totalTicketsReserved: number;

  /** Total number of expected attendees across all events */
  totalExpectedAttendees: number;

  /** Average attendance rate as a percentage */
  averageAttendanceRate: number;

  /** Chart data for top events by ticket sales */
  topEventsChart: ChartJsDataDto;

  /** Chart data for attendance by event category */
  attendanceByCategoryChart: ChartJsDataDto;
}
