// src/app/core/models/friendship/friendship.model.ts
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface FriendshipModel {
  id: number;
  senderId: number;
  receiverId: number;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequestModel {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: Date;
  status: FriendshipStatus;
}

export interface FriendModel {
  id: number;
  friendshipId: number; // ID de la relation d'amitié
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;
}
