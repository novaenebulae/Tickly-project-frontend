/**
 * @file Provides mock implementations for the User API service methods.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiConfigService } from '../api-config.service';
import { UserModel } from '../../../models/user/user.model';
import { UserProfileUpdateDto } from '../../../models/user/user-profile-update.dto';

// Mock data - Ensure mockUsers is an array of UserModel
import { mockUsers } from '../../../mocks/auth/data/user-data.mock';
import {AuthService} from '../../domain/user/auth.service';
import {UserFavoriteStructureModel} from '../../../models/user/user-favorite-structure.model';
import {UserRole} from '../../../models/user/user-role.enum';
import {getRoleIdByKey, mockTeamMembersStructure3} from '../../../mocks/auth/data/team-data.mock';
import {availableRoles, Role, TeamMember} from '../../../models/user/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class UserApiMockService {
  private apiConfig = inject(ApiConfigService);
  private authService = inject(AuthService);

  // In-memory store for mock users (make a copy to allow modifications)
  private currentMockUsers: UserModel[] = JSON.parse(JSON.stringify(mockUsers));
  private mockTeamMembers: TeamMember[] = JSON.parse(JSON.stringify(mockTeamMembersStructure3));
  private readonly currentUserId = this.authService.currentUser()?.userId;

  // Mock favorites storage
  private mockFavorites: UserFavoriteStructureModel[] = [
    {
      id: 1,
      userId: this.currentUserId || 1,
      structureId: 1,
      addedAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: 2,
      userId: this.currentUserId || 1,
      structureId: 3,
      addedAt: new Date('2024-01-20T14:45:00')
    },
    {
      id: 3,
      userId: this.currentUserId || 1,
      structureId: 5,
      addedAt: new Date('2024-02-01T09:15:00')
    }
  ];

  /**
   * Mock implementation for fetching the current authenticated user's profile.
   * @returns An Observable of a `UserModel` object representing the current user's profile,
   *          or an error if the user is not found.
   */
  mockGetCurrentUserProfile(): Observable<UserModel> {
    const endpointContext = 'users/profile (me)'; // For logging
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    const user = this.currentMockUsers.find(u => u.id === this.currentUserId);
    if (!user) {
      return this.apiConfig.createMockError(404, 'Mock: Current user profile not found.');
    }
    // The mock should return data in the format the API would return.
    // Assuming API returns data matching UserModel structure.
    return this.apiConfig.createMockResponse(user);
  }

  /**
   * Mock implementation for fetching a user's profile by their ID.
   * @param userId - The ID of the user whose profile is to be fetched.
   * @returns An Observable of a `UserModel` object, or an error if not found.
   */
  mockGetUserProfileById(userId: number): Observable<UserModel> {
    const endpointContext = `users/byId(${userId})`; // For logging
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    const user = this.currentMockUsers.find(u => u.id === userId);
    if (!user) {
      return this.apiConfig.createMockError(404, `Mock: User profile with ID ${userId} not found.`);
    }
    return this.apiConfig.createMockResponse(user);
  }

  /**
   * Mock implementation for updating the current authenticated user's profile.
   * @param profileUpdateDto - A DTO containing the profile fields to be updated.
   * @returns An Observable of the updated `UserModel` object, or an error.
   */
  mockUpdateCurrentUserProfile(profileUpdateDto: UserProfileUpdateDto): Observable<UserModel> {
    const endpointContext = 'users/profile (me) - update'; // For logging
    this.apiConfig.logApiRequest('MOCK PUT', endpointContext, profileUpdateDto);

    const userIndex = this.currentMockUsers.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) {
      return this.apiConfig.createMockError(404, 'Mock: Current user not found for profile update.');
    }

    // Apply updates to a copy of the user object
    const currentUser = this.currentMockUsers[userIndex];
    const updatedUser: UserModel = {
      ...currentUser,
      firstName: profileUpdateDto.firstName !== undefined ? profileUpdateDto.firstName : currentUser.firstName,
      lastName: profileUpdateDto.lastName !== undefined ? profileUpdateDto.lastName : currentUser.lastName,
      avatarUrl: profileUpdateDto.avatarUrl !== undefined ? (profileUpdateDto.avatarUrl === null ? undefined : profileUpdateDto.avatarUrl) : currentUser.avatarUrl,
      updatedAt: new Date()
    };

    console.log(updatedUser);

    this.currentMockUsers[userIndex] = updatedUser; // Update the in-memory store
    return this.apiConfig.createMockResponse(updatedUser);
  }

  /**
   * Mock implementation for searching users based on a query string.
   * @param query - The search term (e.g., part of a name or email).
   * @returns An Observable of an array of `Partial<UserModel>` objects matching the query.
   *          Returns a subset of fields as the real API might for search results.
   */
  mockSearchUsers(query: string): Observable<Partial<UserModel>[]> {
    const endpointContext = 'users/search'; // For logging
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, { q: query });
    const searchTerm = query.toLowerCase();

    if (!searchTerm.trim()) {
      return this.apiConfig.createMockResponse([]); // Return empty if query is blank
    }

    const results = this.currentMockUsers
      .filter(u =>
        u.id !== this.currentUserId && // Optionally exclude current user from search results
        (u.firstName.toLowerCase().includes(searchTerm) ||
          u.lastName.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm))
      )
      .map(u => ({ // Return a subset of user info, simulating API search results
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        avatarUrl: u.avatarUrl
      }));
    return this.apiConfig.createMockResponse(results);
  }

  /**
   * Mock implementation for fetching user's favorite structures.
   * @returns An Observable of an array of `UserFavoriteStructureModel`.
   */
  mockGetUserFavoriteStructures(): Observable<UserFavoriteStructureModel[]> {
    const endpointContext = 'users/favorites'; // For logging
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    const userFavorites = this.mockFavorites.filter(fav => fav.userId === this.currentUserId);
    return this.apiConfig.createMockResponse(userFavorites);
  }

  /**
   * Mock implementation for adding a structure to favorites.
   * @param structureId - The ID of the structure to add to favorites.
   * @returns An Observable of the created `UserFavoriteStructureModel`.
   */
  mockAddStructureToFavorites(structureId: number): Observable<UserFavoriteStructureModel> {
    const endpointContext = 'users/favorites - add'; // For logging
    this.apiConfig.logApiRequest('MOCK POST', endpointContext, { structureId });

    if (!this.currentUserId) {
      return this.apiConfig.createMockError(401, 'Mock: User not authenticated.');
    }

    // Check if already in favorites
    const existingFavorite = this.mockFavorites.find(
      fav => fav.userId === this.currentUserId && fav.structureId === structureId
    );

    if (existingFavorite) {
      return this.apiConfig.createMockError(409, 'Mock: Structure is already in user favorites.');
    }

    // Create new favorite
    const newFavorite: UserFavoriteStructureModel = {
      id: this.mockFavorites.length + 1,
      userId: this.currentUserId,
      structureId: structureId,
      addedAt: new Date()
    };

    this.mockFavorites.push(newFavorite);
    return this.apiConfig.createMockResponse(newFavorite);
  }

  /**
   * Mock implementation for removing a structure from favorites.
   * @param structureId - The ID of the structure to remove from favorites.
   * @returns An Observable of void.
   */
  mockRemoveStructureFromFavorites(structureId: number): Observable<void> {
    const endpointContext = 'users/favorites - remove'; // For logging
    this.apiConfig.logApiRequest('MOCK DELETE', endpointContext, { structureId });

    if (!this.currentUserId) {
      return this.apiConfig.createMockError(401, 'Mock: User not authenticated.');
    }

    const favoriteIndex = this.mockFavorites.findIndex(
      fav => fav.userId === this.currentUserId && fav.structureId === structureId
    );

    if (favoriteIndex === -1) {
      return this.apiConfig.createMockError(404, 'Mock: Structure not found in user favorites.');
    }

    this.mockFavorites.splice(favoriteIndex, 1);
    return this.apiConfig.createMockResponse(undefined);
  }

  /**
   * Mock implementation for checking if a structure is in user's favorites.
   * @param structureId - The ID of the structure to check.
   * @returns An Observable of boolean indicating if the structure is a favorite.
   */
  mockIsStructureFavorite(structureId: number): Observable<boolean> {
    const endpointContext = 'users/favorites - check'; // For logging
    this.apiConfig.logApiRequest('MOCK GET', endpointContext, { structureId });

    if (!this.currentUserId) {
      return this.apiConfig.createMockResponse(false);
    }

    const isFavorite = this.mockFavorites.some(
      fav => fav.userId === this.currentUserId && fav.structureId === structureId
    );

    return this.apiConfig.createMockResponse(isFavorite);
  }


}
