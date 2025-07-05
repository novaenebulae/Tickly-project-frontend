/**
 * @file Model for event-specific statistics.
 * @licence Proprietary
 */

import {ChartJsDataDto} from './chart-js-data.model';

/**
 * Represents the main DTO for event-specific statistics.
 * Contains all charts and data related to a single event.
 */
export interface EventStatisticsDto {
  /** The ID of the event */
  eventId: number;

  /** The name of the event */
  eventName: string;

  /** The fill percentage of the event (0-100) */
  fillPercentage: number;

  /** The number of unique reservations */
  uniqueReservationAmount: number;

  /** The total number of attributed tickets */
  attributedTicketsAmount: number;

  /** The number of tickets that have been scanned */
  scannedTicketsNumber: number;

  /** Chart data for zone fill rates (capacity vs. tickets sold) */
  zoneFillRateChart: ChartJsDataDto;

  /** Chart data for reservations over time */
  reservationsOverTimeChart: ChartJsDataDto;

  /** Chart data for ticket status distribution (VALID, USED, CANCELLED) */
  ticketStatusChart: ChartJsDataDto;
}
