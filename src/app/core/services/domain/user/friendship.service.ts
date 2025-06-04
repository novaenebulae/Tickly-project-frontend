/**
 * @file Domain service for managing friendships and friend requests.
 * This service encapsulates business logic, composes FriendshipApiService for API interactions,
 * and manages state/cache related to friendships.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject, signal, WritableSignal, computed, effect, Signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';

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

export interface FriendsData {
  friends: FriendModel[];
  pendingRequests: ReceivedFriendRequestModel[];
  sentRequests: SentFriendRequestModel[];
}

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  private friendshipApi = inject(FriendshipApiService);
  private notification = inject(NotificationService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // --- State Management using Signals ---
  private friendsDataSig: WritableSignal<FriendsData> = signal({
    friends: [],
    pendingRequests: [],
    sentRequests: []
  });

  // Computed signals for easier access
  public readonly friends = computed(() => this.friendsDataSig().friends);
  public readonly pendingRequests = computed(() => this.friendsDataSig().pendingRequests);
  public readonly sentRequests = computed(() => this.friendsDataSig().sentRequests);
  public readonly pendingRequestsCount = computed(() => this.friendsDataSig().pendingRequests.length);
  public readonly friendsData: Signal<FriendsData> = computed(() => this.friendsDataSig());

  constructor() {
    // Auto-load data when user logs in or out
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn;
      if (isLoggedIn()) {
        this.loadFriendsData(true).subscribe();
      } else {
        // Clear all friendship related data on logout
        this.friendsDataSig.set({
          friends: [],
          pendingRequests: [],
          sentRequests: []
        });
      }
    });
  }

  /**
   * Loads all friendship data using the unified getFriendsData endpoint.
   * @param forceRefresh - If true, fetches data from the API even if cached.
   * @returns An Observable that completes when data is loaded.
   */
  loadFriendsData(forceRefresh = false): Observable<FriendsData> {
    if (!forceRefresh && this.friendsDataSig().friends.length > 0) {
      return of(this.friendsDataSig());
    }

    return this.friendshipApi.getFriendsData().pipe(
      tap(data => {
        const mappedData: FriendsData = {
          friends: data.friends.map(f => this.mapApiToFriendModel(f)),
          pendingRequests: data.pendingRequests.map(r => this.mapApiToReceivedFriendRequestModel(r)),
          sentRequests: data.sentRequests.map(s => this.mapApiToSentFriendRequestModel(s))
        };
        this.friendsDataSig.set(mappedData);
      }),
      catchError(error => {
        this.handleError("Erreur lors du chargement des données d'amitié.", error);
        return of({
          friends: [],
          pendingRequests: [],
          sentRequests: []
        });
      })
    );
  }

  /**
   * @deprecated Use loadFriendsData() instead
   */
  loadInitialFriendshipData(forceRefresh = false): Observable<void> {
    return this.loadFriendsData(forceRefresh).pipe(
      map(() => undefined)
    );
  }

  /**
   * @deprecated Use friends computed signal instead
   */
  getFriends(forceRefresh = false): Observable<FriendModel[]> {
    return this.loadFriendsData(forceRefresh).pipe(
      map(data => data.friends)
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
          // Refresh friends data to reflect the new sent request
          this.loadFriendsData(true).subscribe();
        }
      }),
      catchError(error => {
        this.handleError("Erreur lors de l'envoi de la demande d'ami.", error);
        return of(undefined);
      })
    );
  }

  /**
   * Accepts a friend request.
   * @param friendshipId - The ID of the friendship record.
   * @returns An Observable of the updated `FriendshipDataModel` or `undefined` on error.
   */
  acceptFriendRequest(friendshipId: number): Observable<FriendshipDataModel | undefined> {
    const dto: UpdateFriendshipStatusDto = { newStatus: FriendshipStatus.ACCEPTED };
    return this.friendshipApi.updateFriendshipStatus(friendshipId, dto).pipe(
      tap(friendshipData => {
        if (friendshipData) {
          this.notification.displayNotification('Demande d\'ami acceptée.', 'valid');
          // Refresh friends data to reflect the acceptance
          this.loadFriendsData(true).subscribe();
        }
      }),
      catchError(error => {
        this.handleError("Erreur lors de l'acceptation de la demande d'ami.", error);
        return of(undefined);
      })
    );
  }

  /**
   * Rejects a friend request.
   * @param friendshipId - The ID of the friendship record.
   * @returns An Observable of the updated `FriendshipDataModel` or `undefined` on error.
   */
  rejectFriendRequest(friendshipId: number): Observable<FriendshipDataModel | undefined> {
    const dto: UpdateFriendshipStatusDto = { newStatus: FriendshipStatus.REJECTED };
    return this.friendshipApi.updateFriendshipStatus(friendshipId, dto).pipe(
      tap(friendshipData => {
        if (friendshipData) {
          this.notification.displayNotification('Demande d\'ami rejetée.', 'valid');
          // Refresh friends data to reflect the rejection
          this.loadFriendsData(true).subscribe();
        }
      }),
      catchError(error => {
        this.handleError("Erreur lors du rejet de la demande d'ami.", error);
        return of(undefined);
      })
    );
  }

  /**
   * Removes or unfriends an existing friend.
   * @param friendshipId - The ID of the friendship record.
   * @returns An Observable that completes when the operation is done.
   */
  removeFriend(friendshipId: number): Observable<void> {
    return this.friendshipApi.removeFriendship(friendshipId).pipe(
      tap(() => {
        this.notification.displayNotification('Ami retiré avec succès.', 'valid');
        // Refresh friends data to reflect the removal
        this.loadFriendsData(true).subscribe();
      }),
      catchError(error => {
        this.handleError("Erreur lors de la suppression de l'ami.", error);
        return of(undefined as void);
      })
    );
  }

  /**
   * Blocks a user.
   * @param friendshipId - The ID of the friendship record.
   * @returns An Observable of the updated `FriendshipDataModel` or `undefined` on error.
   */
  blockUser(friendshipId: number): Observable<FriendshipDataModel | undefined> {
    const dto: UpdateFriendshipStatusDto = { newStatus: FriendshipStatus.BLOCKED };
    return this.friendshipApi.updateFriendshipStatus(friendshipId, dto).pipe(
      tap(friendshipData => {
        if (friendshipData) {
          this.notification.displayNotification('Utilisateur bloqué.', 'valid');
          // Refresh friends data to reflect the blocking
          this.loadFriendsData(true).subscribe();
        }
      }),
      catchError(error => {
        this.handleError("Erreur lors du blocage de l'utilisateur.", error);
        return of(undefined);
      })
    );
  }

  /**
   * Searches for users by name or email.
   * @param query - Search term.
   * @returns An Observable of partial user models.
   */
  searchUsers(query: string): Observable<Partial<UserModel>[]> {
    return this.friendshipApi.searchUsers(query).pipe(
      catchError(error => {
        this.handleError("Erreur lors de la recherche d'utilisateurs.", error);
        return of([]);
      })
    );
  }

  /**
   * Gets friends attending a specific event.
   * @param eventId - The ID of the event.
   * @returns An Observable of friend participants.
   */
  getFriendsAttendingEvent(eventId: number): Observable<FriendParticipantDto[]> {
    return this.friendshipApi.getFriendsAttendingEvent(eventId).pipe(
      catchError(error => {
        this.handleError("Erreur lors de la récupération des amis participant à l'événement.", error);
        return of([]);
      })
    );
  }

  // --- Helper/Mapping Methods ---
  private mapApiToFriendModel(apiFriend: any): FriendModel {
    return {
      userId: apiFriend.userId || apiFriend.id,
      friendshipId: apiFriend.friendshipId,
      firstName: apiFriend.firstName,
      lastName: apiFriend.lastName,
      email: apiFriend.email,
      avatarUrl: apiFriend.avatarUrl
    };
  }

  private mapApiToReceivedFriendRequestModel(apiRequest: any): ReceivedFriendRequestModel {
    return {
      friendshipId: apiRequest.friendshipId,
      sender: apiRequest.sender,
      status: apiRequest.status,
      requestedAt: new Date(apiRequest.requestedAt)
    };
  }

  private mapApiToSentFriendRequestModel(apiRequest: any): SentFriendRequestModel {
    return {
      friendshipId: apiRequest.friendshipId,
      receiver: apiRequest.receiver,
      status: apiRequest.status,
      sentAt: new Date(apiRequest.sentAt)
    };
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.notification.displayNotification(
      error?.message || message,
      'error',
      undefined,
      5000
    );
  }
}
