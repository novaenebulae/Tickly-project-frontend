// // src/app/core/services/api/friendship-api-mock.service.ts
//
// /**
//  * @file Provides mock implementations for the Friendship API service methods.
//  * @licence Proprietary
//  * @author VotreNomOuEquipe
//  */
//
// import { Injectable, inject } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { map } from 'rxjs/operators';
//
// import { ApiConfigService } from '../api-config.service';
// import {
//   FriendshipDataModel,
//   SendFriendRequestDto,
//   UpdateFriendshipStatusDto
// } from '../../../models/friendship/friendship.model';
// import { FriendModel } from '../../../models/friendship/friend.model';
// import { ReceivedFriendRequestModel, SentFriendRequestModel } from '../../../models/friendship/friend-request.model';
// import { FriendshipStatus } from '../../../models/friendship/friendship-status.enum';
// import { FriendParticipantDto } from '../../../models/friendship/friend-participant.dto';
//
// // Mock data - Vous devrez créer ces fichiers de mock
// import {mockUsers} from '../../../mocks/auth/data/user-data.mock';
// import { mockFriendships } from '../../../mocks/friendships/data/friendships-data.mock';
// import {UserModel} from '../../../models/user/user.model'; // Assuming FriendshipDataModel[]
// import { AuthService } from '../../domain/user/auth.service';
// import { FriendsData } from '../../domain/user/friendship.service';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class FriendshipApiMockService {
//   private apiConfig = inject(ApiConfigService);
//   private authService = inject(AuthService);
//
//   // In-memory store for mock friendships to reflect changes (simulates DB)
//   private currentMockFriendships: FriendshipDataModel[] = JSON.parse(JSON.stringify(mockFriendships));
//
//   private getCurrentUserId(): number | undefined {
//     return this.authService.currentUser()?.userId;
//   }
//
//   /**
//    * Mock implementation for getting all friends data (friends, pending requests, sent requests).
//    * @returns Observable of FriendsData.
//    */
//   mockGetFriendsData(): Observable<FriendsData> {
//     this.apiConfig.logApiRequest('MOCK GET', 'friendships/all', null);
//
//     const friends: FriendModel[] = [];
//     const pendingRequests: ReceivedFriendRequestModel[] = [];
//     const sentRequests: SentFriendRequestModel[] = [];
//
//     this.currentMockFriendships.forEach(fs => {
//       const currentUserId = this.getCurrentUserId();
//
//       // Friends (accepted status)
//       if (fs.status === FriendshipStatus.ACCEPTED) {
//         let friendUser;
//         if (fs.senderId === currentUserId) {
//           friendUser = mockUsers.find(u => u.id === fs.receiverId);
//         } else if (fs.receiverId === currentUserId) {
//           friendUser = mockUsers.find(u => u.id === fs.senderId);
//         }
//
//         if (friendUser) {
//           friends.push({
//             userId: friendUser.id,
//             friendshipId: fs.id,
//             firstName: friendUser.firstName,
//             lastName: friendUser.lastName,
//             email: friendUser.email,
//             avatarUrl: friendUser.avatarUrl
//           });
//         }
//       }
//
//       // Pending requests received
//       if (fs.receiverId === currentUserId && fs.status === FriendshipStatus.PENDING) {
//         const senderUser = mockUsers.find(u => u.id === fs.senderId);
//         if (senderUser) {
//           pendingRequests.push({
//             friendshipId: fs.id,
//             sender: {
//               id: senderUser.id,
//               firstName: senderUser.firstName,
//               lastName: senderUser.lastName,
//               email: senderUser.email,
//               avatarUrl: senderUser.avatarUrl
//             },
//             status: fs.status,
//             requestedAt: fs.createdAt
//           });
//         }
//       }
//
//       // Sent requests
//       if (fs.senderId === currentUserId && (fs.status === FriendshipStatus.PENDING || fs.status === FriendshipStatus.REJECTED)) {
//         const receiverUser = mockUsers.find(u => u.id === fs.receiverId);
//         if (receiverUser) {
//           sentRequests.push({
//             friendshipId: fs.id,
//             receiver: {
//               id: receiverUser.id,
//               firstName: receiverUser.firstName,
//               lastName: receiverUser.lastName,
//               email: receiverUser.email,
//               avatarUrl: receiverUser.avatarUrl
//             },
//             status: fs.status,
//             sentAt: fs.createdAt
//           });
//         }
//       }
//     });
//
//     const friendsData: FriendsData = {
//       friends,
//       pendingRequests,
//       sentRequests
//     };
//
//     return this.apiConfig.createMockResponse(friendsData);
//   }
//
//   /**
//    * @deprecated Use mockGetFriendsData() instead
//    */
//   mockGetFriendsList(): Observable<FriendModel[]> {
//     return this.mockGetFriendsData().pipe(
//       map(data => data.friends)
//     );
//   }
//
//   /**
//    * @deprecated Use mockGetFriendsData() instead
//    */
//   mockGetPendingRequests(): Observable<ReceivedFriendRequestModel[]> {
//     return this.mockGetFriendsData().pipe(
//       map(data => data.pendingRequests)
//     );
//   }
//
//   /**
//    * @deprecated Use mockGetFriendsData() instead
//    */
//   mockGetSentRequests(): Observable<SentFriendRequestModel[]> {
//     return this.mockGetFriendsData().pipe(
//       map(data => data.sentRequests)
//     );
//   }
//
//   /**
//    * Mock implementation for sending a friend request.
//    * @param dto - DTO containing receiverId or receiverEmail.
//    * @returns Observable of the created FriendshipDataModel (raw API DTO).
//    */
//   mockSendFriendRequest(dto: SendFriendRequestDto): Observable<FriendshipDataModel> {
//     this.apiConfig.logApiRequest('MOCK POST', 'friendships/request', dto);
//     let receiverId = dto.receiverId;
//     if (!receiverId && dto.receiverEmail) {
//       const targetUser = mockUsers.find(u => u.email.toLowerCase() === dto.receiverEmail!.toLowerCase());
//       if (targetUser) {
//         receiverId = targetUser.id;
//       } else {
//         return this.apiConfig.createMockError(404, 'Receiver email not found');
//       }
//     }
//
//     if (!receiverId || receiverId === this.getCurrentUserId()) {
//       return this.apiConfig.createMockError(400, 'Invalid receiverId or cannot send request to self');
//     }
//
//     const existingFriendship = this.currentMockFriendships.find(
//       fs => (fs.senderId === this.getCurrentUserId() && fs.receiverId === receiverId) ||
//         (fs.senderId === receiverId && fs.receiverId === this.getCurrentUserId())
//     );
//
//     if (existingFriendship && existingFriendship.status !== FriendshipStatus.CANCELLED && existingFriendship.status !== FriendshipStatus.REJECTED) {
//       return this.apiConfig.createMockError(409, `Friendship status already exists: ${existingFriendship.status}`);
//     }
//
//     const newId = Math.max(0, ...this.currentMockFriendships.map(f => f.id)) + 1;
//     const newFriendship: FriendshipDataModel = {
//       id: newId,
//       senderId: this.getCurrentUserId()!,
//       receiverId: receiverId,
//       status: FriendshipStatus.PENDING,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };
//     this.currentMockFriendships.push(newFriendship);
//     return this.apiConfig.createMockResponse(newFriendship);
//   }
//
//   /**
//    * Mock implementation for updating a friendship status (accept, reject, block, cancel).
//    * @param friendshipId - The ID of the friendship record.
//    * @param dto - DTO containing the new status.
//    * @returns Observable of the updated FriendshipDataModel (raw API DTO).
//    */
//   mockUpdateFriendshipStatus(friendshipId: number, dto: UpdateFriendshipStatusDto): Observable<FriendshipDataModel> {
//     this.apiConfig.logApiRequest('MOCK PATCH/PUT', `friendships/requestAction/${friendshipId}`, dto);
//     const friendshipIndex = this.currentMockFriendships.findIndex(fs => fs.id === friendshipId);
//
//     if (friendshipIndex === -1) {
//       return this.apiConfig.createMockError(404, 'Friendship record not found');
//     }
//
//     // Basic validation (backend would have more complex rules)
//     const friendship = this.currentMockFriendships[friendshipIndex];
//     if (friendship.status === FriendshipStatus.ACCEPTED && (dto.newStatus === FriendshipStatus.PENDING || dto.newStatus === FriendshipStatus.REJECTED)) {
//       return this.apiConfig.createMockError(400, `Cannot change status from ${friendship.status} to ${dto.newStatus}`);
//     }
//     if (friendship.status === FriendshipStatus.PENDING && friendship.receiverId !== this.getCurrentUserId() && dto.newStatus === FriendshipStatus.ACCEPTED) {
//       return this.apiConfig.createMockError(403, 'Only the receiver can accept a pending request');
//     }
//
//     this.currentMockFriendships[friendshipIndex] = {
//       ...friendship,
//       status: dto.newStatus,
//       updatedAt: new Date()
//     };
//     return this.apiConfig.createMockResponse(this.currentMockFriendships[friendshipIndex]);
//   }
//
//   /**
//    * Mock implementation for removing/cancelling a friendship.
//    * This is essentially updating status to CANCELLED.
//    * @param friendshipId - The ID of the friendship record.
//    * @returns Observable of void.
//    */
//   mockRemoveFriendship(friendshipId: number): Observable<void> {
//     this.apiConfig.logApiRequest('MOCK DELETE', `friendships/requestAction/${friendshipId}`, null);
//     const friendshipIndex = this.currentMockFriendships.findIndex(fs => fs.id === friendshipId);
//
//     if (friendshipIndex === -1) {
//       return this.apiConfig.createMockError(404, 'Friendship record not found');
//     }
//     // Instead of splicing, we often mark as cancelled or deleted
//     this.currentMockFriendships[friendshipIndex].status = FriendshipStatus.CANCELLED;
//     this.currentMockFriendships[friendshipIndex].updatedAt = new Date();
//     // Or, if the API actually deletes:
//     // this.currentMockFriendships.splice(friendshipIndex, 1);
//     return this.apiConfig.createMockResponse(undefined as void);
//   }
//
//   /**
//    * Mock implementation for searching users (e.g., to add as friends).
//    * @param query - Search term (name or email).
//    * @returns Observable of raw API user DTOs.
//    */
//   mockSearchUsers(query: string): Observable<Partial<UserModel>[]> {
//     this.apiConfig.logApiRequest('MOCK GET', 'users/search', { q: query });
//     const searchTerm = query.toLowerCase();
//     const results = mockUsers
//       .filter(user =>
//         user.firstName.toLowerCase().includes(searchTerm) ||
//         user.lastName.toLowerCase().includes(searchTerm) ||
//         user.email.toLowerCase().includes(searchTerm)
//       )
//       .slice(0, 10) // Limit results
//       .map(user => ({
//         id: user.id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         avatarUrl: user.avatarUrl
//       }));
//     return this.apiConfig.createMockResponse(results);
//   }
//
//   /**
//    * Mock implementation for getting friends attending a specific event.
//    * @param eventId - The ID of the event.
//    * @returns Observable of FriendParticipantDto[].
//    */
//   mockGetFriendsAttendingEvent(eventId: number): Observable<FriendParticipantDto[]> {
//     this.apiConfig.logApiRequest('MOCK GET', `friendships/friends-attending-event/${eventId}`, null);
//     // This would require event participation mock data, which is out of scope for friendship models
//     // Returning an empty array for now, but in a real implementation, you'd cross-reference with event participation data
//     const friendsAttending: FriendParticipantDto[] = [];
//     return this.apiConfig.createMockResponse(friendsAttending);
//   }
// }
