// src/app/core/models/auth/user.model.ts
export interface UserModel {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  structureId?: number;  // ID de la structure associée (si administrateur)
  createdAt?: Date;
  updatedAt?: Date;
  needsStructureSetup?: boolean; // Indique si l'utilisateur doit configurer sa structure
}

export interface UserRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  createStructure: boolean;
}
