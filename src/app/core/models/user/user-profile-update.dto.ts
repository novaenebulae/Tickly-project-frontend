// src/app/core/models/user/user-profile-update.dto.ts

/**
 * @file Defines the DTO for updating a user's profile information.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Data Transfer Object for updating a user's profile.
 * Conforms to the PUT /api/v1/users/me endpoint.
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

  /**
   * The user's email address.
   */
  email?: string;

  // The avatarUrl is managed by a specific endpoint (/api/v1/users/me/avatar)

}
