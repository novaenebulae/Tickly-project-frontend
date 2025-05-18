// src/app/core/models/auth/auth.model.ts
export interface JwtPayload {
  sub: string;
  userId: number;
  role: string;
  needsStructureSetup?: boolean;
  structureId?: number;
  iat?: number;
  exp?: number;
}

export interface AuthResponseDto {
  token: string;
  needsStructureSetup: boolean;
  userId: number;
  role: string;
}

/**
 * Interface pour les credentials de connexion
 */
export interface LoginCredentials {
  email: string | null;
  password: string | null;
}
