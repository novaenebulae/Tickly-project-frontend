/**
 * @file Modèle pour la réponse d'acceptation d'invitation d'équipe.
 * @licence Proprietary
 */

/**
 * Réponse de l'API lors de l'acceptation d'une invitation d'équipe.
 */
export interface TeamInvitationAcceptanceResponseDto {
  /**
   * Le nouveau token JWT avec les informations mises à jour.
   */
  accessToken: string;

  /**
   * Durée de validité du token en millisecondes.
   */
  expiresIn: number;

  /**
   * ID de la structure à laquelle l'utilisateur a été ajouté.
   */
  structureId: number;

  /**
   * Nom de la structure.
   */
  structureName: string;

  /**
   * Message de confirmation.
   */
  message: string;
}
