// src/app/core/models/user/user-profile-update.dto.ts

/**
 * @file Defines the DTO for updating a user's profile information.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Data Transfer Object for updating a user's profile.
 * All fields are optional; only provided fields will be updated by the backend.
 */
export interface UserProfileUpdateDto {
  /**
   * The user's first name.
   */
  firstName?: string;

  /**
   * The user's last name.
   */
  lastName?: string;

  // Email is typically not updatable directly or handled via a separate verification process.
  // email?: string;

  /**
   * URL of the user's avatar image.
   * Can be set to null to request avatar removal if the API supports it.
   */
  avatarUrl?: string | null;

  // Password changes are usually handled by a separate endpoint/flow in AuthService/AuthApiService.
  // currentPassword?: string;
  // newPassword?: string;

  // Role changes are typically admin-only operations via a different mechanism/endpoint.
}
