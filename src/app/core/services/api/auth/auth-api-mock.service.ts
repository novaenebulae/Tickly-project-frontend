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
import {mockUsers as defaultMockUsers, MockUserModel} from '../../../mocks/auth/data/user-data.mock';
import {APP_CONFIG} from '../../../config/app-config';
import {UserRole} from '../../../models/user/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthApiMockService {

  private apiConfig = inject(ApiConfigService);
  private payload = {};

  // Clé pour le stockage localStorage
  private readonly MOCK_USERS_STORAGE_KEY = 'users';

  constructor() {
    // Assurer que les données mock sont chargées depuis localStorage
    this.initializeMockUsers();
  }

  /**
   * Initialise les données mock users depuis localStorage ou utilise les données par défaut.
   */
  private initializeMockUsers(): void {
    const storedUsers = this.apiConfig.loadMockDataFromStorage(this.MOCK_USERS_STORAGE_KEY, defaultMockUsers);

    // Synchroniser avec le tableau global mockUsers
    defaultMockUsers.length = 0; // Vider le tableau
    defaultMockUsers.push(...storedUsers); // Ajouter les données du storage
  }

  /**
   * Sauvegarde les données mock users dans localStorage.
   */
  private saveMockUsers(): void {
    this.apiConfig.saveMockDataToStorage(this.MOCK_USERS_STORAGE_KEY, defaultMockUsers);
  }

  /**
   * Met à jour les informations de structure d'un utilisateur.
   */
  updateUserStructureInfo(userId: number, structureId: number): void {
    const userIndex = defaultMockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      defaultMockUsers[userIndex] = {
        ...defaultMockUsers[userIndex],
        structureId: structureId,
        needsStructureSetup: false,
        updatedAt: new Date()
      };
      this.saveMockUsers();
      console.log(`Mock user ${userId} updated with structure ${structureId}`);
    }
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

    // Construire le payload selon le rôle
    let payload;
    if (role === UserRole.STRUCTURE_ADMINISTRATOR) {
      payload = {
        ...baseUserPayload,
        "structureId": structureId || null,
        "needsStructureSetup": needsStructureSetup !== undefined ? needsStructureSetup : true
      };
    } else {
      payload = baseUserPayload;
    }

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));

    // Pour un mock, on utilise une signature simple mais valide
    const signature = btoa(`mock-signature-${userId}-${role}-${Date.now()}`);

    return `${base64Header}.${base64Payload}.${signature}`;
  }

  /**
   * Génère un nouveau token avec les informations de structure mises à jour
   */
  generateUpdatedToken(userId: number, structureId: number): string {
    const user = defaultMockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Générer un nouveau token avec les informations mises à jour
    return this.generateValidMockToken(
      user.id,
      user.email,
      user.role,
      false, // needsStructureSetup = false après création
      structureId
    );
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

    const user = defaultMockUsers.find(u =>
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

    const existingUser = defaultMockUsers.find(u =>
      u.email.toLowerCase() === userRegistrationDto.email.toLowerCase()
    );

    if (existingUser) {
      return this.apiConfig.createMockError(409, 'This email address is already in use');
    }

    if (!userRegistrationDto.email || !userRegistrationDto.password || !userRegistrationDto.firstName || !userRegistrationDto.lastName) {
      return this.apiConfig.createMockError(400, 'Invalid data. Please verify the fields.');
    }

    // Calculer le nouvel ID en fonction des utilisateurs existants
    const newUserId = Math.max(...defaultMockUsers.map(u => u.id), 0) + 1;
    const newUserRole = userRegistrationDto.createStructure ? UserRole.STRUCTURE_ADMINISTRATOR : UserRole.SPECTATOR;

    // **CORRECTION : Créer et ajouter le nouvel utilisateur aux données mock**
    const today = new Date();
    const newUser: MockUserModel = {
      id: newUserId,
      firstName: userRegistrationDto.firstName,
      lastName: userRegistrationDto.lastName,
      email: userRegistrationDto.email,
      password: userRegistrationDto.password,
      role: newUserRole,
      structureId: userRegistrationDto.createStructure ? undefined : undefined, // Pour un nouvel admin, pas encore de structure créée
      createdAt: today,
      updatedAt: today,
      needsStructureSetup: userRegistrationDto.createStructure || false,
      avatarUrl: `https://picsum.photos/seed/user${newUserId}/200/200`,
      mockToken: `mock_token_${userRegistrationDto.firstName.toLowerCase()}_${userRegistrationDto.lastName.toLowerCase()}_${Date.now()}`
    };

    // **AJOUT CRUCIAL : Ajouter l'utilisateur au tableau mock et sauvegarder**
    defaultMockUsers.push(newUser);
    this.saveMockUsers(); // Sauvegarder dans localStorage

    console.log(`Mock user created and added:`, newUser);
    console.log(`Total mock users now: ${defaultMockUsers.length}`);

    // Générer un token JWT valide pour le nouvel utilisateur
    const validToken = this.generateValidMockToken(newUserId, userRegistrationDto.email, newUserRole, userRegistrationDto.createStructure);

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
