/**
 * @file Provides mock implementations for the Auth API service methods.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiConfigService} from '../api-config.service';
import {AuthResponseDto, LoginCredentials} from '../../../models/auth/auth.model';
import {UserRegistrationDto} from '../../../models/user/user.model';
import {mockUsers} from '../../../mocks/auth/data/user-data.mock';
import {APP_CONFIG} from '../../../config/app-config';
import {UserRole} from '../../../models/user/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthApiMockService {

  private apiConfig = inject(ApiConfigService);
  private payload = {};

  constructor() {

  }


  /**
   * Génère un token JWT valide pour les tests
   */
  private generateValidMockToken(userId: number, userMail: string, role: UserRole, needsStructureSetup?: boolean, structureId?: number): string {
    // Créer un JWT simple mais valide pour les tests
    const header = {
      "alg": "HS256",
      "typ": "JWT"
    };

    const baseUserPayload = {
      "sub": userMail.toString(),
      "role": role,
      "userId": userId,
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
    };

    if (role == UserRole.STRUCTURE_ADMINISTRATOR) {

      this.payload = {
        ...baseUserPayload,
        "structureId": structureId,
        "needsStructureSetup": needsStructureSetup
      }

    } else {
      this.payload = baseUserPayload
    }

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(this.payload));

    // Pour un mock, on utilise une signature simple
    const signature = btoa(`mock-signature-${userId}-${role}`);

    return `${base64Header}.${base64Payload}.${signature}`;
  }

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

    // Créer un token JWT valide
    const validToken = this.generateValidMockToken(user.id, user.email, user.role, user.needsStructureSetup, user.structureId);

    // Create a mock response with a token and user details
    const mockResponse: AuthResponseDto = {
      token: validToken,
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

    const newUserId = mockUsers.length + 1;
    const newUserRole = userRegistrationDto.createStructure ? UserRole.STRUCTURE_ADMINISTRATOR : UserRole.SPECTATOR;

    // Générer un token JWT valide pour le nouvel utilisateur
    const validToken = this.generateValidMockToken(newUserId, userRegistrationDto.email,newUserRole, userRegistrationDto.createStructure);

    const mockResponse: AuthResponseDto = {
      token: validToken,
      userId: newUserId,
      needsStructureSetup: userRegistrationDto.createStructure || false,
      role: newUserRole
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

    // Pour les mocks, on génère un nouveau token valide
    const newToken = this.getStoredToken();

    const mockResponse: AuthResponseDto = {
      token: newToken!,
      userId: 1,
      needsStructureSetup: false,
      role: UserRole.SPECTATOR
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
