/**
 * @file Provides mock implementations for the Auth API service methods.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api-config.service';
import { LoginCredentials, AuthResponseDto} from '../../../models/auth/auth.model';
import { UserRegistrationDto } from '../../../models/user/user.model';
import { mockUsers} from '../../../mocks/auth/users.mock';
import {APP_CONFIG} from '../../../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class AuthApiMockService {

  private apiConfig = inject(ApiConfigService);

  /**
   * Mock implementation of the login API.
   * @param credentials - Login credentials (email and password).
   * @returns An Observable of AuthResponseDto representing the mock authentication response.
   */
  mockLogin(credentials: LoginCredentials): Observable<AuthResponseDto> {
    this.apiConfig.logApiRequest('MOCK POST', 'login', credentials);

    if (!credentials.email || !credentials.password) {
      return this.apiConfig.createMockError(400, 'Email and password are required');
    }

    const user = mockUsers.find(u =>
      u.email.toLowerCase() === credentials.email.toLowerCase() &&
      u.password === credentials.password
    );

    if (!user) {
      return this.apiConfig.createMockError(401, 'Incorrect email or password');
    }

    // Create a mock response with a token and user details
    const mockResponse: AuthResponseDto = {
      token: user.mockToken,
      userId: user.id,
      needsStructureSetup: user.needsStructureSetup || false,
      role: user.role
    };
    return this.apiConfig.createMockResponse(mockResponse);
  }

  /**
   * Mock implementation of the register API.
   * @param userRegistrationDto - User registration data.
   * @returns An Observable of AuthResponseDto representing the mock registration response.
   */
  mockRegister(userRegistrationDto: UserRegistrationDto): Observable<AuthResponseDto> {
    this.apiConfig.logApiRequest('MOCK POST', 'register', userRegistrationDto);

    const existingUser = mockUsers.find(u =>
      u.email.toLowerCase() === userRegistrationDto.email.toLowerCase()
    );

    if (existingUser) {
      return this.apiConfig.createMockError(409, 'This email address is already in use');
    }

    if (!userRegistrationDto.email || !userRegistrationDto.password || !userRegistrationDto.firstName || !userRegistrationDto.lastName) {
      return this.apiConfig.createMockError(400, 'Invalid data. Please verify the fields.');
    }

    // Simulate a new user with a mock token
    const newUserToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const mockResponse: AuthResponseDto = {
      token: newUserToken,
      userId: mockUsers.length + 1,
      needsStructureSetup: userRegistrationDto.createStructure || false, // Based on registration choice
      role: 'USER' // Or 'ADMIN' based on createStructure - adjust as needed
    };
    return this.apiConfig.createMockResponse(mockResponse);
  }

  /**
   * Mock implementation of the refresh token API.
   * @returns An Observable of AuthResponseDto with a refreshed token.
   */
  mockRefreshToken(): Observable<AuthResponseDto> {
    this.apiConfig.logApiRequest('MOCK POST', 'refresh-token', {});

    const token = this.getStoredToken();
    if (!token) {
      return this.apiConfig.createMockError(401, 'Token not available');
    }

    const newToken = `${token.split('_')[0]}_refreshed_${Date.now()}`;
    // For refresh, we'd keep the same user details as in the current token
    const mockResponse: AuthResponseDto = {
      token: newToken,
      userId: 1, // This should be extracted from the existing token
      needsStructureSetup: false,
      role: 'USER' // This should also be extracted from the existing token
    };
    return this.apiConfig.createMockResponse(mockResponse);
  }

  /**
   * Helper function to retrieve a stored token from local or session storage.
   * Used internally for the mockRefreshToken method.
   * @returns The stored authentication token or null if not found.
   */
  private getStoredToken(): string | null {
    const keepLoggedIn = localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey) === 'true';
    return keepLoggedIn
      ? localStorage.getItem(APP_CONFIG.auth.tokenKey)
      : sessionStorage.getItem(APP_CONFIG.auth.tokenKey);
  }
}
