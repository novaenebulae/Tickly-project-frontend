// src/app/core/models/user/user-profile-update.dto.ts

/**
 * @file Defines the DTO for updating a user's profile information.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Data Transfer Object for updating a user's profile.
 * Conforme au endpoint PUT /api/v1/users/me
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

  // L'avatarUrl est géré par un endpoint spécifique (/api/v1/users/me/avatar)

}
