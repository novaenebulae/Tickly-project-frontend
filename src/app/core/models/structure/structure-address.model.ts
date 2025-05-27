// src/app/core/models/structure/address.model.ts

/**
 * Represents a physical address.
 */
export interface StructureAddressModel {
  /**
   * The country of the address.
   * @example "France"
   */
  country: string;

  /**
   * The city of the address.
   * @example "Paris"
   */
  city: string;

  /**
   * The street name and number.
   * @example "123 Rue de Rivoli"
   */
  street: string;

  /**
   * Optional street number, if not included in 'street'.
   * @example "Apartment 4B"
   */
  number?: string;

  /**
   * The postal code or zip code.
   * @example "75001"
   */
  zipCode?: string;
}
