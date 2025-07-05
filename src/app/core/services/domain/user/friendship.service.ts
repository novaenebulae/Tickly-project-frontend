/**
 * @file Domain service for managing friendships and friend requests.
 * This service encapsulates business logic, composes FriendshipApiService for API interactions,
 * and manages state/cache related to friendships.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {computed, effect, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';

// API Service
import {FriendshipApiService} from '../../api/friendship/friendship-api.service';

// Domain Services
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from './auth.service'; // For current user context
// Models and DTOs
import {SendFriendRequestDto, UpdateFriendshipStatusDto} from '../../../models/friendship/friendship.model';
import {FriendModel} from '../../../models/friendship/friend.model';
import {ReceivedFriendRequestModel, SentFriendRequestModel} from '../../../models/friendship/friend-request.model';
import {FriendshipStatus} from '../../../models/friendship/friendship-status.enum';
import {FriendParticipantDto} from '../../../models/friendship/friend-participant.dto';
import {HttpErrorResponse} from '@angular/common/http';

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
   * La méthode met directement à jour le signal interne avec les données de l'API.
   * @param forceRefresh - If true, fetches data from the API even if there's existing data.
   * @returns An Observable that completes when data is loaded.
   */
  loadFriendsData(forceRefresh = false): Observable<void> {
    // Si on ne force pas le rafraîchissement et qu'on a déjà des données, on ne fait rien.
    if (!forceRefresh && this.friendsDataSig().friends.length > 0) {
      return of(undefined);
    }

    return this.friendshipApi.getFriendsData().pipe(
      tap(data => {
        // Plus besoin de mapper ! Les modèles correspondent à la réponse de l'API.
        this.friendsDataSig.set(data);
      }),
      map(() => undefined), // On transforme le retour en void car le composant n'utilise pas la data directement.
      catchError(error => {
        this.handleError(error.message || "Erreur lors du chargement des données d'amitié.", error);
        // En cas d'erreur, on réinitialise l'état pour ne pas afficher de données corrompues.
        this.friendsDataSig.set({ friends: [], pendingRequests: [], sentRequests: [] });
        return of(undefined); // On termine le flux proprement.
      })
    );
  }

  // --- Friend Request Operations ---

  // /**
  //  * Sends a friend request to a user identified by their ID or email.
  //  * If email is provided, it first searches for the user.
  //  * @param identifier - User ID (number) or email (string).
  //  * @returns An Observable of the created `FriendshipDataModel` (from API) or `undefined` on error/user not found.
  //  */
  // sendFriendRequest(identifier: number | string): Observable<FriendshipDataModel | undefined> {
  //   if (typeof identifier === 'string') { // Identifier is an email
  //     return this.userService.searchUsers(identifier).pipe(
  //       switchMap(users => {
  //         if (users && users.length > 0 && users[0].id) {
  //           const targetUser = users[0];
  //           if (targetUser.id === this.authService.currentUser()?.userId) {
  //             this.notification.displayNotification("Vous ne pouvez pas vous envoyer une demande d'ami.", "warning");
  //             return of(undefined);
  //           }
  //           const dto: SendFriendRequestDto = { receiverId: targetUser.id };
  //           return this.executeSendFriendRequest(dto);
  //         } else {
  //           this.notification.displayNotification(`Utilisateur avec l'email "${identifier}" non trouvé.`, 'error');
  //           return of(undefined);
  //         }
  //       }),
  //       catchError(error => {
  //         this.handleError("Erreur lors de la recherche d'utilisateur pour la demande d'ami.", error);
  //         return of(undefined);
  //       })
  //     );
  //   } else { // Identifier is a user ID
  //     if (identifier === this.authService.currentUser()?.userId) {
  //       this.notification.displayNotification("Vous ne pouvez pas vous envoyer une demande d'ami.", "warning");
  //       return of(undefined);
  //     }
  //     const dto: SendFriendRequestDto = { receiverId: identifier };
  //     return this.executeSendFriendRequest(dto);
  //   }
  // }

  sendFriendRequestByEmail(email: string): Observable<void> {
    const dto: SendFriendRequestDto = {email: email};
    return this.friendshipApi.sendFriendRequest(dto).pipe(
      switchMap(() => {
        this.notification.displayNotification(`Demande d'ami envoyée à ${email}.`, 'valid');
        return this.loadFriendsData(true);
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleError(error.message, error);
        return throwError(() => error);
        })
      );
    }

  cancelSentRequest(friendshipId: number): Observable<void> {
    const dto: UpdateFriendshipStatusDto = { status: FriendshipStatus.CANCELLED };
    return this.friendshipApi.updateFriendshipStatus(friendshipId, dto).pipe(
      tap(() => {
        this.notification.displayNotification('La demande a été annulée.', 'valid');
        this.friendsDataSig.update(currentData => ({
          ...currentData,
          sentRequests: currentData.sentRequests.filter(req => req.friendshipId !== friendshipId)
        }));
      }),
      map(() => undefined),
      catchError(error => {
        this.notification.displayNotification("Impossible d'annuler la demande.", 'error');
        return throwError(() => error);
      })
    );
  }

  /**
   * Accepts a pending friend request.
   * @param friendshipId The ID of the request to accept.
   */
  acceptFriendRequest(friendshipId: number): Observable<void> {
    return this.respondToFriendRequest(friendshipId, FriendshipStatus.ACCEPTED);
  }

  /**
   * Rejects a pending friend request.
   * @param friendshipId The ID of the request to reject.
   */
  rejectFriendRequest(friendshipId: number): Observable<void> {
    return this.respondToFriendRequest(friendshipId, FriendshipStatus.REJECTED);
  }

  /**
   * Responds to a friend request by accepting or rejecting it.
   * @param friendshipId The ID of the friendship to update.
   * @param status The new status (ACCEPTED or REJECTED).
   * @private
   */
  private respondToFriendRequest(friendshipId: number, status: FriendshipStatus): Observable<void> {
    const dto: UpdateFriendshipStatusDto = { status: status };
    return this.friendshipApi.updateFriendshipStatus(friendshipId, dto).pipe(
      tap(() => {
        // Upon success, refresh all friendship data to ensure UI consistency.
        this.loadFriendsData(true).subscribe();
        const message = status === FriendshipStatus.ACCEPTED ? 'Demande d\'ami acceptée.' : 'Demande d\'ami refusée.';
        this.notification.displayNotification(message, 'valid');
      }),
      map(() => undefined), // Convert to Observable<void> for the component
      catchError(error => {
        this.handleError(error.message || "Erreur lors de la mise à jour de la demande d\'ami.", error);

        return throwError(() => error);
      })
    );
  }

  /**
   * Removes or unfriends an existing friend.
   * @param friendId - The ID of the friend.
   * @returns An Observable that completes when the operation is done.
   */
  removeFriend(friendId: number): Observable<void> {
    return this.friendshipApi.removeFriendship(friendId).pipe(
      tap(() => {
        this.notification.displayNotification('Ami retiré avec succès.', 'valid');
        // Refresh friends data to reflect the removal
        this.loadFriendsData(true).subscribe();
      }),
      catchError(error => {
        this.handleError(error.message || "Erreur lors de la suppression de l'ami.", error);
        return of(undefined as void);
      })
    );
  }

  // /**
  //  * Blocks a user.
  //  * @param friendshipId - The ID of the friendship record.
  //  * @returns An Observable of the updated `FriendshipDataModel` or `undefined` on error.
  //  */
  // blockUser(friendshipId: number): Observable<FriendshipDataModel | undefined> {
  //   const dto: UpdateFriendshipStatusDto = { newStatus: FriendshipStatus.BLOCKED };
  //   return this.friendshipApi.updateFriendshipStatus(friendshipId, dto).pipe(
  //     tap(friendshipData => {
  //       if (friendshipData) {
  //         this.notification.displayNotification('Utilisateur bloqué.', 'valid');
  //         // Refresh friends data to reflect the blocking
  //         this.loadFriendsData(true).subscribe();
  //       }
  //     }),
  //     catchError(error => {
  //       this.handleError("Erreur lors du blocage de l'utilisateur.", error);
  //       return of(undefined);
  //     })
  //   );
  // }

  /**
   * Gets friends attending a specific event.
   * @param eventId - The ID of the event.
   * @returns An Observable of friend participants.
   */
  getFriendsAttendingEvent(eventId: number): Observable<FriendParticipantDto[]> {
    return this.friendshipApi.getFriendsAttendingEvent(eventId).pipe(
      catchError(error => {
        this.handleError(error.message || "Erreur lors de la récupération des amis participant à l'événement.", error);
        return of([]);
      })
    );
  }

  // --- Helper/Mapping Methods ---

  private handleError(message: string, error: any): void {
    this.notification.displayNotification(
      message,
      'error',
      undefined,
      5000
    );
  }
}
