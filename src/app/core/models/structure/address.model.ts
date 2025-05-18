// src/app/core/models/structure/address.model.ts
export interface AddressModel {
  country: string;
  city: string;
  street: string;
  number?: string;
  zipCode?: string;
}
