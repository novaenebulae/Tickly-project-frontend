// src/app/core/models/structure/structure.model.ts
import { AddressModel } from './address.model';
import { AreaModel } from './area.model';
import { StructureTypeModel } from './structure-type.model';

export interface StructureModel {
  id?: number;
  name: string;
  types: StructureTypeModel[];
  description?: string;
  address: AddressModel;
  areas?: AreaModel[];    // Les zones définies dans cette structure
  phone?: string;         // Numéro de téléphone
  email?: string;         // Email de contact
  websiteUrl?: string;    // Adresse du site web
  socialsUrl?: string[];  // Tableau d'URLs des réseaux sociaux
  logoUrl?: string;       // URL du logo
  createdAt?: Date;
  updatedAt?: Date;
  importance?: number;
}

// DTOs pour les opérations CRUD
export interface StructureCreationDto {
  name: string;
  typeIds: number[];
  description?: string;
  address: AddressModel;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  socialsUrl?: string[];
}

export interface StructureCreationResponse {
  newToken: string;
  createdStructure?: StructureModel;
}
