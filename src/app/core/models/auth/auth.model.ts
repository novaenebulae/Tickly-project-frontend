// src/app/core/models/auth/auth.model.ts
import {UserRole} from '../user/user-role.enum';

/**
 * Represents the payload of a JSON Web Token (JWT).
 */
export interface JwtPayload {
  /**
   * The subject of the token, typically the user's unique identifier (e.g., username or email).
   */
  sub: string;

  /**
   * The unique identifier of the user.
   */
  userId: number;

  /**
   * The role of the user.
   */
  role: UserRole;

  /**
   * The ID of the structure associated with the user (optional).
   */
  structureId?: number;

  /**
   * The timestamp indicating when the token was issued (in seconds since epoch).
   */
  iat?: number;

  /**
   * The timestamp indicating when the token expires (in seconds since epoch).
   */
  exp?: number;
}

/**
 * Represents the response from the authentication API.
 */
export interface AuthResponseDto {
  /**
   * The JWT token for the authenticated user.
   */
  accessToken?: string;

  expiresIn: number;

  firstName: string;

  lastName: string;

  email: string;

  /**
   * The unique identifier of the user.
   */
  userId: number;

  /**
   * The role of the user.
   */
  role: UserRole;
}

/**
 * Represents the login credentials (email and password).
 */
export interface LoginCredentials {
  /**
   * The user's email address.
   */
  email: string;

  /**
   * The user's password.
   */
  password: string;
}
