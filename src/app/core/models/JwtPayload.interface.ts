// Interface pour le payload JWT attendu
export interface JwtPayload {
  sub: string; // email
  userId: number;
  role: string; // "SPECTATOR", "STRUCTURE_ADMINISTRATOR", etc.
  needsStructureSetup?: boolean; // Optionnel, car inclus conditionnellement
  iat?: number;
  exp?: number;
}
