/**
 * @file Domain service for managing friendships and friend requests.
 * This service encapsulates business logic, composes FriendshipApiService for API interactions,
 * and manages state/cache related to friendships.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject, signal, WritableSignal, computed, effect } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, catchError, switchMap, filter } from 'rxjs/operators';

// API Service
import { FriendshipApiService } from '../../api/friendship/friendship-api.service';

// Domain Services
import { NotificationService } from '../utilities/notification.service';
import { UserService } from './user.service'; // For searching users
import { AuthService } from './auth.service'; // For current user context

// Models and DTOs
import {
  FriendshipDataModel,
  SendFriendRequestDto,
  UpdateFriendshipStatusDto
} from '../../../models/friendship/friendship.model';
import { FriendModel } from '../../../models/friendship/friend.model';
import { ReceivedFriendRequestModel, SentFriendRequestModel } from '../../../models/friendship/friend-request.model';
import { FriendshipStatus } from '../../../models/friendship/friendship-status.enum';
import { FriendParticipantDto } from '../../../models/friendship/friend-participant.dto';
import { UserModel } from '../../../models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  private friendshipApi = inject(FriendshipApiService);
  private notification = inject(NotificationService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // --- State Management using Signals ---
  private friendsSig: WritableSignal<FriendModel[]> = signal([]);
  public readonly friends = computed(() => this.friendsSig());

  private pendingRequestsSig: WritableSignal<ReceivedFriendRequestModel[]> = signal([]);
  public readonly pendingRequests = computed(() => this.pendingRequestsSig());
  public readonly pendingRequestsCount = computed(() => this.pendingRequestsSig().length);

  private sentRequestsSig: WritableSignal<SentFriendRequestModel[]> = signal([]);
  public readonly sentRequests = computed(() => this.sentRequestsSig());

  constructor() {
    // Auto-load data when user logs in or out
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn;
      if (isLoggedIn()) {
        this.loadInitialFriendshipData(true).subscribe();
      } else {
        // Clear all friendship related data on logout
        this.friendsSig.set([]);
        this.pendingRequestsSig.set([]);
        this.sentRequestsSig.set([]);
      }
    });
  }

  /**
   * Loads all initial friendship data (friends list, pending requests, sent requests).
   * Typically called on login or when a refresh is needed.
   * @param forceRefresh - If true, fetches all data from the API.
   * @returns An Observable that completes when all data is loaded.
   */
  loadInitialFriendshipData(forceRefresh = false): Observable<void> {

    if (!forceRefresh && this.friendsSig().length > 0 && this.pendingRequestsSig().length > 0) {
      return of(undefined);
    }

    return forkJoin({
      friends: this.friendshipApi.getFriendsList(),
      pending: this.friendshipApi.getPendingRequests(),
      sent: this.friendshipApi.getSentRequests()
    }).pipe(
      tap(results => {
        this.friendsSig.set(results.friends.map(f => this.mapApiToFriendModel(f)));
        this.pendingRequestsSig.set(results.pending.map(r => this.mapApiToReceivedFriendRequestModel(r)));
        this.sentRequestsSig.set(results.sent.map(s => this.mapApiToSentFriendRequestModel(s)));
        // this.notification.displayNotification("Données d'amitié à jour.", 'valid', undefined, 2000);
      }),
      map(() => undefined), // Convert to Observable<void>
      catchError(error => {
        this.handleError("Erreur lors du chargement initial des données d'amitié.", error);
        return of(undefined);
      })
    );
  }


  /**
   * Retrieves the list of current user's friends.
   * Uses cached data if available, otherwise fetches from API.
   * @param forceRefresh - If true, fetches from the API even if cached.
   * @returns An Observable of `FriendModel[]`.
   */
  getFriends(forceRefresh = false): Observable<FriendModel[]> {
    if (!forceRefresh && this.friendsSig().length > 0) {
      return of(this.friendsSig());
    }
    return this.friendshipApi.getFriendsList().pipe(
      map(apiFriends => apiFriends.map(f => this.mapApiToFriendModel(f))),
      tap(friends => this.friendsSig.set(friends)),
      catchError(error => {
        this.handleError("Impossible de récupérer la liste d'amis.", error);
        return of([]);
      })
    );
  }

  // --- Friend Request Operations ---

  /**
   * Sends a friend request to a user identified by their ID or email.
   * If email is provided, it first searches for the user.
   * @param identifier - User ID (number) or email (string).
   * @returns An Observable of the created `FriendshipDataModel` (from API) or `undefined` on error/user not found.
   */
  sendFriendRequest(identifier: number | string): Observable<FriendshipDataModel | undefined> {
    if (typeof identifier === 'string') { // Identifier is an email
      return this.userService.searchUsers(identifier).pipe(
        switchMap(users => {
          if (users && users.length > 0 && users[0].id) {
            const targetUser = users[0];
            if (targetUser.id === this.authService.currentUser()?.userId) {
              this.notification.displayNotification("Vous ne pouvez pas vous envoyer une demande d'ami.", "warning");
              return of(undefined);
            }
            const dto: SendFriendRequestDto = { receiverId: targetUser.id };
            return this.executeSendFriendRequest(dto);
          } else {
            this.notification.displayNotification(`Utilisateur avec l'email "${identifier}" non trouvé.`, 'error');
            return of(undefined);
          }
        }),
        catchError(error => {
          this.handleError("Erreur lors de la recherche d'utilisateur pour la demande d'ami.", error);
          return of(undefined);
        })
      );
    } else { // Identifier is a user ID
      if (identifier === this.authService.currentUser()?.userId) {
        this.notification.displayNotification("Vous ne pouvez pas vous envoyer une demande d'ami.", "warning");
        return of(undefined);
      }
      const dto: SendFriendRequestDto = { receiverId: identifier };
      return this.executeSendFriendRequest(dto);
    }
  }

  private executeSendFriendRequest(dto: SendFriendRequestDto): Observable<FriendshipDataModel | undefined> {
    return this.friendshipApi.sendFriendRequest(dto).pipe(
      tap(friendshipData => {
        if (friendshipData) {
          this.notification.displayNotification('Demande d\'ami envoyée avec succès.', 'valid');
          // Optimistically update sent requests or trigger a refresh
          this.loadInitialFriendshipData(true).subscribe();
        }
      }),
      catchError(error => {
        this.handleError("Erreur lors de l'envoi de la demande d'ami.", error);
        return of(undefined);
      })
    );
  }

  /**
   * Retrieves pending friend requests received by the current user.
   * @param forceRefresh - If true, fetches from the API.
   * @returns An Observable of `ReceivedFriendRequestModel[]`.
   */
  getPendingFriendRequests(forceRefresh = false): Observable<ReceivedFriendRequestModel[]> {
    if (!forceRefresh && this.pendingRequestsSig().length > 0) {
      return of(this.pendingRequestsSig());
    }
    return this.friendshipApi.getPendingRequests().pipe(
      map(apiRequests => apiRequests.map(r => this.mapApiToReceivedFriendRequestModel(r))),
      tap(requests => this.pendingRequestsSig.set(requests)),
      catchError(error => {
        this.handleError("Impossible de récupérer les demandes d'ami en attente.", error);
        return of([]);
      })
    );
  }

  /**
   * Retrieves friend requests sent by the current user.
   * @param forceRefresh - If true, fetches from the API.
   * @returns An Observable of `SentFriendRequestModel[]`.
   */
  getSentFriendRequests(forceRefresh = false): Observable<SentFriendRequestModel[]> {
    if (!forceRefresh && this.sentRequestsSig().length > 0) {
      return of(this.sentRequestsSig());
    }
    return this.friendshipApi.getSentRequests().pipe(
      map(apiRequests => apiRequests.map(s => this.mapApiToSentFriendRequestModel(s))),
      tap(requests => this.sentRequestsSig.set(requests)),
      catchError(error => {
        this.handleError("Impossible de récupérer les demandes d'ami envoyées.", error);
        return of([]);
      })
    );
  }

  /**
   * Accepts a pending friend request.
   * @param friendshipId - The ID of the friendship record (from `ReceivedFriendRequestModel`).
   * @returns An Observable<boolean> indicating success.
   */
  acceptFriendRequest(friendshipId: number): Observable<boolean> {
    const dto: UpdateFriendshipStatusDto = { newStatus: FriendshipStatus.ACCEPTED };
    return this.updateFriendshipStatus(friendshipId, dto, 'Demande d\'ami acceptée.');
  }

  /**
   * Rejects a pending friend request.
   * @param friendshipId - The ID of the friendship record.
   * @returns An Observable<boolean> indicating success.
   */
  rejectFriendRequest(friendshipId: number): Observable<boolean> {
    const dto: UpdateFriendshipStatusDto = { newStatus: FriendshipStatus.REJECTED };
    return this.updateFriendshipStatus(friendshipId, dto, 'Demande d\'ami rejetée.');
  }

  /**
   * Blocks a user (associated with a friendship record ID).
   * @param friendshipId - The ID of the friendship record.
   * @returns An Observable<boolean> indicating success.
   */
  blockUser(friendshipId: number): Observable<boolean> {
    const dto: UpdateFriendshipStatusDto = { newStatus: FriendshipStatus.BLOCKED };
    return this.updateFriendshipStatus(friendshipId, dto, 'Utilisateur bloqué.');
  }

  /**
   * Cancels an existing friendship (unfriend).
   * @param friendshipId - The ID of the friendship record.
   * @returns An Observable<boolean> indicating success.
   */
  cancelFriendship(friendshipId: number): Observable<boolean> {
    // This can either call a specific "remove" endpoint or update status to CANCELLED
    // Using removeFriendship from API service for clarity if API has a dedicated DELETE
    return this.friendshipApi.removeFriendship(friendshipId).pipe(
      map(() => true),
      tap(() => {
        this.notification.displayNotification('Amitié annulée.', 'valid');
        this.loadInitialFriendshipData(true).subscribe(); // Refresh all lists
      }),
      catchError(error => {
        this.handleError("Erreur lors de l'annulation de l'amitié.", error);
        return of(false);
      })
    );
    // Alternatively, if using status update:
    // const dto: UpdateFriendshipStatusDto = { newStatus: FriendshipStatus.CANCELLED };
    // return this.updateFriendshipStatus(friendshipId, dto, 'Amitié annulée.');
  }

  /**
   * General method to update friendship status.
   * Refreshes all friendship lists on success.
   */
  private updateFriendshipStatus(friendshipId: number, dto: UpdateFriendshipStatusDto, successMessage: string): Observable<boolean> {
    return this.friendshipApi.updateFriendshipStatus(friendshipId, dto).pipe(
      map(updatedFriendshipData => !!updatedFriendshipData), // True if data returned
      tap(success => {
        if (success) {
          this.notification.displayNotification(successMessage, 'valid');
          this.loadInitialFriendshipData(true).subscribe(); // Refresh all lists
        }
      }),
      catchError(error => {
        this.handleError(`Erreur lors de la mise à jour du statut de l'amitié.`, error);
        return of(false);
      })
    );
  }

  // --- Other Friendship-related Operations ---

  /**
   * Searches for users to potentially add as friends.
   * This method now delegates to UserService.
   * @param query - The search term (name or email).
   * @returns An Observable of `Partial<UserModel>[]`.
   */
  searchUsersForFriendship(query: string): Observable<Partial<UserModel>[]> {
    return this.userService.searchUsers(query); // UserService handles its own errors/notifications
  }


  /**
   * Retrieves friends of the current user who are attending a specific event.
   * @param eventId - The ID of the event.
   * @returns An Observable of `FriendParticipantDto[]`.
   */
  getFriendsAttendingEvent(eventId: number): Observable<FriendParticipantDto[]> {
    return this.friendshipApi.getFriendsAttendingEvent(eventId).pipe(
      map(apiParticipants => apiParticipants.map(p => this.mapApiToFriendParticipantDto(p))),
      catchError(error => {
        this.handleError(`Impossible de récupérer les amis participant à l'événement.`, error);
        return of([]);
      })
    );
  }


  // --- Data Mapping Utilities ---
  // These mappers assume API DTOs have the same property names as our frontend models.
  // Add transformations (e.g., for dates) if necessary.

  private mapApiToFriendModel(apiFriend: any): FriendModel {
    return apiFriend as FriendModel; // Add date transformations if createdAt/updatedAt are strings
  }

  private mapApiToReceivedFriendRequestModel(apiRequest: any): ReceivedFriendRequestModel {
    return {
      ...apiRequest,
      requestedAt: new Date(apiRequest.requestedAt) // Ensure date conversion
    } as ReceivedFriendRequestModel;
  }

  private mapApiToSentFriendRequestModel(apiRequest: any): SentFriendRequestModel {
    return {
      ...apiRequest,
      sentAt: new Date(apiRequest.sentAt) // Ensure date conversion
    } as SentFriendRequestModel;
  }

  private mapApiToFriendParticipantDto(apiParticipant: any): FriendParticipantDto {
    return apiParticipant as FriendParticipantDto;
  }

  private mapApiToFriendshipDataModel(apiFriendship: any): FriendshipDataModel {
    return {
      ...apiFriendship,
      createdAt: new Date(apiFriendship.createdAt),
      updatedAt: new Date(apiFriendship.updatedAt),
    } as FriendshipDataModel;
  }

  /**
   * Centralized error handler for friendship-related operations.
   */
  private handleError(message: string, error: any): void {
    console.error(`FriendshipService Error: ${message}`, error.originalError || error);
    this.notification.displayNotification(
      error.message || message,
      'error'
    );
  }
}
