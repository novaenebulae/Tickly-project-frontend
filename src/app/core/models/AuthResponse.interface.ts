// Interface pour la réponse attendue du backend (/register et /login)
export interface AuthResponseDto {
  token: string;
  needsStructureSetup: boolean;
  userId: number;
  role: string;
}
