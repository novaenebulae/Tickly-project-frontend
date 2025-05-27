/**
 * @file Defines the models related to audience zones for an event, including seating types.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Defines the possible types of placement within an audience zone for an event.
 */
export enum SeatingType {
  /**
   * Indicates that the zone has assigned/numbered seats.
   * (Note: Specific seat assignment is not handled by this model).
   */
  SEATED = 'seated',

  /**
   * Indicates that the zone offers free-standing room for the audience.
   */
  STANDING = 'standing',

  /**
   * Indicates that the zone may offer a combination of seated and standing areas,
   * or the type is not specifically defined.
   */
  MIXED = 'mixed'
}

/**
 * Represents a specific zone configured for the audience at an event.
 * This is distinct from a `StructureAreaModel` which is a permanent physical area of a structure.
 * An `EventAudienceZone` is a setup within a `StructureAreaModel` for a particular event.
 */
export interface EventAudienceZone {
  /**
   * The unique identifier for this audience zone configuration for the event.
   * Optional, as it's not present before creation or if managed differently by the backend.
   */
  id?: number;

  /**
   * The name of the audience zone.
   * @example "Fosse Or", "Balcon Rangée A", "Zone Debout Scène Gauche"
   */
  name: string;

  /**
   * The ID of the `StructureAreaModel` (physical area within the structure)
   * where this audience zone is located/configured.
   */
  areaId: number;

  /**
   * The maximum number of attendees this audience zone can accommodate for the event.
   */
  maxCapacity: number;

  /**
   * Indicates if this audience zone is active and available for booking for the event.
   */
  isActive: boolean;

  /**
   * The type of seating or placement offered in this zone for the event.
   */
  seatingType: SeatingType;

  // ticketPrice: number; // Removed - no price management
  // rowCount?: number; // Removed - no seat numbering
  // seatsPerRow?: number; // Removed - no seat numbering
}
