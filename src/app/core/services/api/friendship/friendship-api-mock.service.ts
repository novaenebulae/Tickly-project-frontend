// src/app/core/services/api/friendship-api-mock.service.ts

/**
 * @file Provides mock implementations for the Friendship API service methods.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import {
  FriendshipDataModel,
  SendFriendRequestDto,
  UpdateFriendshipStatusDto
} from '../../../models/friendship/friendship.model';
import { FriendModel } from '../../../models/friendship/friend.model';
import { ReceivedFriendRequestModel, SentFriendRequestModel } from '../../../models/friendship/friend-request.model';
import { FriendshipStatus } from '../../../models/friendship/friendship-status.enum';
import { FriendParticipantDto } from '../../../models/friendship/friend-participant.dto';

// Mock data - Vous devrez créer ces fichiers de mock
import {mockUsers} from '../../../mocks/auth/data/user-data.mock';
import { mockFriendships } from '../../../mocks/friendships/data/friendships-data.mock';
import {UserModel} from '../../../models/user/user.model'; // Assuming FriendshipDataModel[]
import { AuthService } from '../../domain/user/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FriendshipApiMockService {
  private apiConfig = inject(ApiConfigService);
  private authService = inject(AuthService);

  // In-memory store for mock friendships to reflect changes (simulates DB)
  private currentMockFriendships: FriendshipDataModel[] = JSON.parse(JSON.stringify(mockFriendships));

  private getCurrentUserId(): number | undefined {
    return this.authService.currentUser()?.userId;
  }

  /**
   * Mock implementation for getting the current user's friends list.
   * @returns Observable of raw API friend DTOs (matching FriendModel structure).
   */
  mockGetFriendsList(): Observable<FriendModel[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'friendships/friends', null);
    const friends: FriendModel[] = [];
    this.currentMockFriendships.forEach(fs => {
      if (fs.status === FriendshipStatus.ACCEPTED) {
        let friendUser;
        if (fs.senderId === this.getCurrentUserId()) {
          friendUser = mockUsers.find(u => u.id === fs.receiverId);
        } else if (fs.receiverId === this.getCurrentUserId()) {
          friendUser = mockUsers.find(u => u.id === fs.senderId);
        }

        if (friendUser) {
          friends.push({
            userId: friendUser.id,
            friendshipId: fs.id,
            firstName: friendUser.firstName,
            lastName: friendUser.lastName,
            email: friendUser.email,
            avatarUrl: friendUser.avatarUrl
          });
        }
      }
    });
    return this.apiConfig.createMockResponse(friends);
  }

  /**
   * Mock implementation for sending a friend request.
   * @param dto - DTO containing receiverId or receiverEmail.
   * @returns Observable of the created FriendshipDataModel (raw API DTO).
   */
  mockSendFriendRequest(dto: SendFriendRequestDto): Observable<FriendshipDataModel> {
    this.apiConfig.logApiRequest('MOCK POST', 'friendships/request', dto);
    let receiverId = dto.receiverId;
    if (!receiverId && dto.receiverEmail) {
      const targetUser = mockUsers.find(u => u.email.toLowerCase() === dto.receiverEmail!.toLowerCase());
      if (targetUser) {
        receiverId = targetUser.id;
      } else {
        return this.apiConfig.createMockError(404, 'Receiver email not found');
      }
    }

    if (!receiverId || receiverId === this.getCurrentUserId()) {
      return this.apiConfig.createMockError(400, 'Invalid receiverId or cannot send request to self');
    }

    const existingFriendship = this.currentMockFriendships.find(
      fs => (fs.senderId === this.getCurrentUserId() && fs.receiverId === receiverId) ||
        (fs.senderId === receiverId && fs.receiverId === this.getCurrentUserId())
    );

    if (existingFriendship && existingFriendship.status !== FriendshipStatus.CANCELLED && existingFriendship.status !== FriendshipStatus.REJECTED) {
      return this.apiConfig.createMockError(409, `Friendship status already exists: ${existingFriendship.status}`);
    }

    const newId = Math.max(0, ...this.currentMockFriendships.map(f => f.id)) + 1;
    const newFriendship: FriendshipDataModel = {
      id: newId,
      senderId: this.getCurrentUserId()!,
      receiverId: receiverId,
      status: FriendshipStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.currentMockFriendships.push(newFriendship);
    return this.apiConfig.createMockResponse(newFriendship);
  }

  /**
   * Mock implementation for getting pending friend requests received by the current user.
   * @returns Observable of raw API DTOs (matching ReceivedFriendRequestModel structure).
   */
  mockGetPendingRequests(): Observable<ReceivedFriendRequestModel[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'friendships/pending', null);
    const requests: ReceivedFriendRequestModel[] = [];
    this.currentMockFriendships.forEach(fs => {
      if (fs.receiverId === this.getCurrentUserId() && fs.status === FriendshipStatus.PENDING) {
        const senderUser = mockUsers.find(u => u.id === fs.senderId);
        if (senderUser) {
          requests.push({
            friendshipId: fs.id,
            sender: {
              id: senderUser.id,
              firstName: senderUser.firstName,
              lastName: senderUser.lastName,
              email: senderUser.email,
              avatarUrl: senderUser.avatarUrl
            },
            status: fs.status,
            requestedAt: fs.createdAt
          });
        }
      }
    });
    return this.apiConfig.createMockResponse(requests);
  }

  /**
   * Mock implementation for getting friend requests sent by the current user.
   * @returns Observable of raw API DTOs (matching SentFriendRequestModel structure).
   */
  mockGetSentRequests(): Observable<SentFriendRequestModel[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'friendships/sent', null);
    const requests: SentFriendRequestModel[] = [];
    this.currentMockFriendships.forEach(fs => {
      if (fs.senderId === this.getCurrentUserId() && (fs.status === FriendshipStatus.PENDING || fs.status === FriendshipStatus.REJECTED)) {
        const receiverUser = mockUsers.find(u => u.id === fs.receiverId);
        if (receiverUser) {
          requests.push({
            friendshipId: fs.id,
            receiver: {
              id: receiverUser.id,
              firstName: receiverUser.firstName,
              lastName: receiverUser.lastName,
              email: receiverUser.email,
              avatarUrl: receiverUser.avatarUrl
            },
            status: fs.status,
            sentAt: fs.createdAt
          });
        }
      }
    });
    return this.apiConfig.createMockResponse(requests);
  }

  /**
   * Mock implementation for updating a friendship status (accept, reject, block, cancel).
   * @param friendshipId - The ID of the friendship record.
   * @param dto - DTO containing the new status.
   * @returns Observable of the updated FriendshipDataModel (raw API DTO).
   */
  mockUpdateFriendshipStatus(friendshipId: number, dto: UpdateFriendshipStatusDto): Observable<FriendshipDataModel> {
    this.apiConfig.logApiRequest('MOCK PATCH/PUT', `friendships/requestAction/${friendshipId}`, dto);
    const friendshipIndex = this.currentMockFriendships.findIndex(fs => fs.id === friendshipId);

    if (friendshipIndex === -1) {
      return this.apiConfig.createMockError(404, 'Friendship record not found');
    }

    // Basic validation (backend would have more complex rules)
    const friendship = this.currentMockFriendships[friendshipIndex];
    if (friendship.status === FriendshipStatus.ACCEPTED && (dto.newStatus === FriendshipStatus.PENDING || dto.newStatus === FriendshipStatus.REJECTED)) {
      return this.apiConfig.createMockError(400, `Cannot change status from ${friendship.status} to ${dto.newStatus}`);
    }
    if (friendship.status === FriendshipStatus.PENDING && friendship.receiverId !== this.getCurrentUserId() && dto.newStatus === FriendshipStatus.ACCEPTED) {
      return this.apiConfig.createMockError(403, 'Only the receiver can accept a pending request');
    }


    this.currentMockFriendships[friendshipIndex] = {
      ...friendship,
      status: dto.newStatus,
      updatedAt: new Date()
    };
    return this.apiConfig.createMockResponse(this.currentMockFriendships[friendshipIndex]);
  }


  /**
   * Mock implementation for removing/cancelling a friendship.
   * This is essentially updating status to CANCELLED.
   * @param friendshipId - The ID of the friendship record.
   * @returns Observable of void.
   */
  mockRemoveFriendship(friendshipId: number): Observable<void> {
    this.apiConfig.logApiRequest('MOCK DELETE', `friendships/requestAction/${friendshipId}`, null);
    const friendshipIndex = this.currentMockFriendships.findIndex(fs => fs.id === friendshipId);

    if (friendshipIndex === -1) {
      return this.apiConfig.createMockError(404, 'Friendship record not found');
    }
    // Instead of splicing, we often mark as cancelled or deleted
    this.currentMockFriendships[friendshipIndex].status = FriendshipStatus.CANCELLED;
    this.currentMockFriendships[friendshipIndex].updatedAt = new Date();
    // Or, if the API actually deletes:
    // this.currentMockFriendships.splice(friendshipIndex, 1);
    return this.apiConfig.createMockResponse(undefined as void);
  }

  /**
   * Mock implementation for searching users (e.g., to add as friends).
   * @param query - Search term (name or email).
   * @returns Observable of raw API user DTOs.
   */
  mockSearchUsers(query: string): Observable<Partial<UserModel>[]> {
    this.apiConfig.logApiRequest('MOCK GET', 'users/search', { q: query });
    const searchTerm = query.toLowerCase();
    const results = mockUsers.filter(u =>
      u.id !== this.getCurrentUserId() && // Don't find self
      (u.firstName.toLowerCase().includes(searchTerm) ||
        u.lastName.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm))
    ).map(u => ({ // Return a subset of user info as API might
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      avatarUrl: u.avatarUrl
    }));
    return this.apiConfig.createMockResponse(results);
  }

  /**
   * Mock implementation for getting friends attending a specific event.
   * @param eventId - The ID of the event.
   * @returns Observable of FriendParticipantDto array.
   */
  mockGetFriendsAttendingEvent(eventId: number): Observable<FriendParticipantDto[]> {
    this.apiConfig.logApiRequest('MOCK GET', `friendships/events/${eventId}/attendees`, null);
    // This mock needs more data: which events users are attending.
    // For now, let's return a few mock friends as attending.
    const friendsList = this.currentMockFriendships
      .filter(fs => fs.status === FriendshipStatus.ACCEPTED && (fs.senderId === this.getCurrentUserId() || fs.receiverId === this.getCurrentUserId()))
      .map(fs => fs.senderId === this.getCurrentUserId() ? fs.receiverId : fs.senderId);

    const attendingFriends: FriendParticipantDto[] = [];
    const friendsToPotentiallyAttend = mockUsers.filter(u => friendsList.includes(u.id));

    // Simulate some friends attending
    for (let i = 0; i < Math.min(friendsToPotentiallyAttend.length, 2); i++) { // Max 2 attending for mock
      const friend = friendsToPotentiallyAttend[i];
      attendingFriends.push({
        userId: friend.id,
        firstName: friend.firstName,
        lastName: friend.lastName,
        avatarUrl: friend.avatarUrl
      });
    }
    return this.apiConfig.createMockResponse(attendingFriends);
  }
}
