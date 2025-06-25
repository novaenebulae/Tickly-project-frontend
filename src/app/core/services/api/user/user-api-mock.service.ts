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
import { mockUsers, MockUserModel } from '../../../mocks/auth/data/user-data.mock';
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

  // Clés pour le stockage localStorage
  private readonly MOCK_USERS_STORAGE_KEY = 'users';
  private readonly MOCK_FAVORITES_STORAGE_KEY = 'user_favorites';

  // Cela garantit que les deux services partagent la même référence aux données
  private mockTeamMembers: TeamMember[] = JSON.parse(JSON.stringify(mockTeamMembersStructure3));

  // Getter pour obtenir l'ID utilisateur actuel de manière dynamique
  private get currentUserId(): number | undefined {
    return this.authService.currentUser()?.userId;
  }

  // Mock favorites storage - maintenant géré avec localStorage
  private mockFavorites: UserFavoriteStructureModel[] = [];

  constructor() {
    // Initialiser les données depuis localStorage
    this.initializeMockData();
  }

  /**
   * Initialise les données mock depuis localStorage.
   */
  private initializeMockData(): void {
    // Charger les utilisateurs depuis localStorage
    const storedUsers = this.apiConfig.loadMockDataFromStorage(this.MOCK_USERS_STORAGE_KEY, mockUsers);

    // Synchroniser avec le tableau global mockUsers
    mockUsers.length = 0; // Vider le tableau
    mockUsers.push(...storedUsers); // Ajouter les données du storage

  }

  /**
   * Sauvegarde les utilisateurs dans localStorage.
   */
  private saveMockUsers(): void {
    this.apiConfig.saveMockDataToStorage(this.MOCK_USERS_STORAGE_KEY, mockUsers);
  }

  /**
   * Mock implementation for fetching the current authenticated user's profile.
   * @returns An Observable of a `UserModel` object representing the current user's profile,
   *          or an error if the user is not found.
   */
  mockGetCurrentUserProfile(): Observable<UserModel> {
    const endpointContext = 'users/profile (me)'; // For logging
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    const user = mockUsers.find(u => u.id === this.currentUserId);
    if (!user) {
      return this.apiConfig.createMockError(404, 'Mock: Current user profile not found.');
    }
    // Convert MockUserModel to UserModel by excluding mock-specific fields
    const userProfile: UserModel = this.convertMockUserToUserModel(user);
    return this.apiConfig.createMockResponse(userProfile);
  }

  /**
   * Mock implementation for fetching a user's profile by their ID.
   * @param userId - The ID of the user whose profile is to be fetched.
   * @returns An Observable of a `UserModel` object, or an error if not found.
   */
  mockGetUserProfileById(userId: number): Observable<UserModel> {
    const endpointContext = `users/byId(${userId})`; // For logging
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return this.apiConfig.createMockError(404, `Mock: User profile with ID ${userId} not found.`);
    }
    // Convert MockUserModel to UserModel by excluding mock-specific fields
    const userProfile: UserModel = this.convertMockUserToUserModel(user);
    return this.apiConfig.createMockResponse(userProfile);
  }

  /**
   * Mock implementation for updating the current authenticated user's profile.
   * @param profileUpdateDto - A DTO containing the profile fields to be updated.
   * @returns An Observable of the updated `UserModel` object, or an error.
   */
  mockUpdateCurrentUserProfile(profileUpdateDto: UserProfileUpdateDto): Observable<UserModel> {
    const endpointContext = 'users/profile (me) - update'; // For logging
    this.apiConfig.logApiRequest('MOCK PUT', endpointContext, profileUpdateDto);

    const userIndex = mockUsers.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) {
      return this.apiConfig.createMockError(404, 'Mock: Current user not found for profile update.');
    }

    // Apply updates to the existing MockUserModel object
    const currentUser = mockUsers[userIndex];
    const updatedMockUser: MockUserModel = {
      ...currentUser,
      firstName: profileUpdateDto.firstName !== undefined ? profileUpdateDto.firstName : currentUser.firstName,
      lastName: profileUpdateDto.lastName !== undefined ? profileUpdateDto.lastName : currentUser.lastName,
      updatedAt: new Date()
    };

    console.log('Updated mock user:', updatedMockUser);

    mockUsers[userIndex] = updatedMockUser; // Update the in-memory store
    this.saveMockUsers(); // Sauvegarder dans localStorage

    // Convert to UserModel for response
    const userModelResponse: UserModel = this.convertMockUserToUserModel(updatedMockUser);
    return this.apiConfig.createMockResponse(userModelResponse);
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

    const results = mockUsers
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
   * Converts a MockUserModel to a UserModel by excluding mock-specific fields.
   * @param mockUser - The MockUserModel to convert.
   * @returns A UserModel without mock-specific fields.
   */
  private convertMockUserToUserModel(mockUser: MockUserModel): UserModel {
    // Destructure to exclude mock-specific fields
    const { password, mockToken, ...userModel } = mockUser;
    return userModel;
  }
}
