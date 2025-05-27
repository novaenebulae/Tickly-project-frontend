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
import { mockUsers } from '../../../mocks/auth/users.mock';

@Injectable({
  providedIn: 'root'
})
export class UserApiMockService {
  private apiConfig = inject(ApiConfigService);

  // In-memory store for mock users (make a copy to allow modifications)
  // This simulates changes being persistent during the mock session.
  private currentMockUsers: UserModel[] = JSON.parse(JSON.stringify(mockUsers));
  private currentUserId = 1; // Example: Simulate a logged-in user for 'users/me' context.
                             // In a more advanced mock setup, this could be dynamic.

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

  // Placeholder for other mock user-related API methods if needed in the future.
  // For example:
  // mockAdminGetAllUsers(params: UserSearchParams): Observable<UserModel[]>
  // mockAdminUpdateUser(userId: number, userUpdateDto: AdminUserUpdateDto): Observable<UserModel>
  // mockAdminDeleteUser(userId: number): Observable<void>
}
