import {inject, Injectable} from '@angular/core';
import {Client, IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {AuthService} from '../domain/user/auth.service';
import {TicketModel} from '../../models/tickets/ticket.model';

/**
 * Interface for pending subscription
 */
interface PendingSubscription {
  destination: string;
  callback: (message: IMessage) => void;
}

/**
 * Interface for event ticket statistics
 */
export interface EventTicketStatisticsDto {
  eventId: number;
  eventName?: string;
  totalTickets: number;
  scannedTickets: number;
  remainingTickets: number;
  fillRate: number;
}

/**
 * Service for handling WebSocket connections for real-time updates
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private authService = inject(AuthService);

  // Connection status
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  // Message subjects for different topics
  private ticketUpdateSubject = new Subject<TicketModel>();
  private statisticsUpdateSubject = new Subject<EventTicketStatisticsDto>();

  // Store pending subscriptions to apply when client connects
  private pendingSubscriptions: PendingSubscription[] = [];

  /**
   * Initializes the WebSocket connection
   */
  public connect(): void {
    if (this.client) {
      return;
    }

    try {
      this.client = new Client({
        webSocketFactory: () => {
          try {
            return new SockJS(`${environment.apiUrl}/ws-tickly`);
          } catch (error) {
            console.warn('Error creating SockJS instance:', error);
            return null;
          }
        },
        connectHeaders: this.getConnectHeaders(),
        debug: (str) => {
          if (environment.enableDebugLogs) {
            console.log(str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      this.client.onConnect = () => {
        console.log('WebSocket connection established');
        this.connectionStatus.next(true);

        // Apply any pending subscriptions
        if (this.pendingSubscriptions.length > 0) {
          console.log(`Applying ${this.pendingSubscriptions.length} pending subscriptions`);

          // Process all pending subscriptions
          for (const subscription of this.pendingSubscriptions) {
            try {
              if (environment.enableDebugLogs) {
                console.log(`Subscribing to ${subscription.destination}`);
              }

              this.client?.subscribe(subscription.destination, subscription.callback);
            } catch (error) {
              console.warn(`Error subscribing to ${subscription.destination}:`, error);
            }
          }

          // Clear the pending subscriptions
          this.pendingSubscriptions = [];
        }
      };

      this.client.onDisconnect = () => {
        console.log('WebSocket connection closed');
        this.connectionStatus.next(false);
      };

      this.client.onStompError = (frame) => {
        console.error('WebSocket error:', frame);
        this.connectionStatus.next(false);
      };

      this.client.onWebSocketError = (event) => {
        console.warn('WebSocket connection error:', event);
        this.connectionStatus.next(false);
      };

      this.client.activate();
    } catch (error) {
      console.warn('Failed to initialize WebSocket client:', error);
      this.connectionStatus.next(false);
    }
  }

  /**
   * Disconnects the WebSocket connection
   */
  public disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connectionStatus.next(false);
    }
  }

  /**
   * Subscribes to ticket updates for a specific event
   * @param eventId The ID of the event
   * @returns An Observable of TicketModel
   */
  public subscribeToTicketUpdates(eventId: number | string): Observable<TicketModel> {
    try {
      if (!this.client || !this.client.connected) {
        this.connect();
      }

      const destination = `/topic/event/${eventId}/ticket-update`;

      // Create the message callback function
      const messageCallback = (message: IMessage) => {
        try {
          if (environment.enableDebugLogs) {
            console.log('Received ticket update message:', message.body);
          }
          const ticketUpdate: TicketModel = JSON.parse(message.body);
          if (environment.enableDebugLogs) {
            console.log('Parsed ticket update:', ticketUpdate);
          }
          this.ticketUpdateSubject.next(ticketUpdate);
        } catch (error) {
          console.warn('Error parsing ticket update message:', error);
        }
      };

      if (this.client && this.client.connected) {
        try {
          console.log(`Subscribing to ticket updates for event ${eventId}`);
          this.client.subscribe(destination, messageCallback);
        } catch (error) {
          console.warn('Error subscribing to ticket updates:', error);
        }
      } else {
        // Add to pending subscriptions to be processed when client connects
        console.log(`Adding ticket updates subscription for event ${eventId} to pending list`);
        this.pendingSubscriptions.push({
          destination,
          callback: messageCallback
        });
      }
    } catch (error) {
      console.warn('Error in subscribeToTicketUpdates:', error);
    }

    return this.ticketUpdateSubject.asObservable();
  }

  /**
   * Subscribes to statistics updates for a specific event
   * @param eventId The ID of the event
   * @returns An Observable of EventTicketStatisticsDto
   */
  public subscribeToStatisticsUpdates(eventId: number | string): Observable<EventTicketStatisticsDto> {
    try {
      if (!this.client || !this.client.connected) {
        this.connect();
      }

      const destination = `/topic/event/${eventId}/statistics`;

      // Create the message callback function
      const messageCallback = (message: IMessage) => {
        try {
          if (environment.enableDebugLogs) {
            console.log('Received statistics message:', message.body);
          }
          const statisticsUpdate: EventTicketStatisticsDto = JSON.parse(message.body);
          if (environment.enableDebugLogs) {
            console.log('Parsed statistics update:', statisticsUpdate);
          }
          this.statisticsUpdateSubject.next(statisticsUpdate);
        } catch (error) {
          console.warn('Error parsing statistics update message:', error);
        }
      };

      if (this.client && this.client.connected) {
        try {
          console.log(`Subscribing to statistics updates for event ${eventId}`);
          this.client.subscribe(destination, messageCallback);
        } catch (error) {
          console.warn('Error subscribing to statistics updates:', error);
        }
      } else {
        // Add to pending subscriptions to be processed when client connects
        console.log(`Adding statistics updates subscription for event ${eventId} to pending list`);
        this.pendingSubscriptions.push({
          destination,
          callback: messageCallback
        });
      }
    } catch (error) {
      console.warn('Error in subscribeToStatisticsUpdates:', error);
    }

    return this.statisticsUpdateSubject.asObservable();
  }

  /**
   * Gets the connect headers for the WebSocket connection
   * @returns The connect headers
   */
  private getConnectHeaders(): { [key: string]: string } {
    const token = this.authService.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
