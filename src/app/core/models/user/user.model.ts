// src/app/core/models/auth/user.model.ts
import { UserRole } from './user-role.enum';

/**
 * Represents a user in the application.
 */
export interface UserModel {
  /**
   * The unique identifier of the user (assigned by the backend).
   */
  id: number;

  /**
   * The first name of the user.
   */
  firstName: string;

  /**
   * The last name of the user.
   */
  lastName: string;

  /**
   * The email address of the user (must be unique).
   */
  email: string;

  /**
   * The role of the user.
   */
  role: UserRole;

  /**
   * The ID of the structure associated with the user (if administrator).
   */
  structureId?: number;

  /**
   * The date and time when the user account was created (assigned by the backend).
   */
  createdAt?: Date;

  /**
   * The date and time when the user account was last updated (assigned by the backend).
   */
  updatedAt?: Date;

  /**
   * Indicates whether the user needs to set up their structure (e.g., after initial registration).
   */
  needsStructureSetup?: boolean;

  /**
   * URL of the user's avatar image (optional).
   */
  avatarUrl?: string;
}

/**
 * Represents the data required to register a new user.
 */
export interface UserRegistrationDto {
  /**
   * The first name of the user.
   */
  firstName: string;

  /**
   * The last name of the user.
   */
  lastName: string;

  /**
   * The email address of the user (must be unique).
   */
  email: string;

  /**
   * The password for the new user account. REQUIRED.
   */
  password: string;

  /**
   * Indicates whether the user wants to create a new structure during registration.
   */
  createStructure: boolean;
}
