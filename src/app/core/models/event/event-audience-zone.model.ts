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
  SEATED = 'SEATED',

  /**
   * Indicates that the zone offers free-standing room for the audience.
   */
  STANDING = 'STANDING',

  /**
   * Indicates that the zone may offer a combination of seated and standing areas,
   * or the type is not specifically defined.
   */
  MIXED = 'MIXED'
}

/**
 * Represents a specific zone configured for the audience at an event.
 * This is distinct from a `StructureAreaModel` which is a permanent physical area of a structure.
 * An `EventAudienceZone` is a setup within a `StructureAreaModel` for a particular event.
 * Matches the EventAudienceZoneDto from the API.
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
   * The allocated capacity for this audience zone.
   */
  allocatedCapacity: number;

  /**
   * The remaining capacity for this audience zone.
   */
  remainingCapacity: number;

  /**
   * The type of seating or placement offered in this zone for the event.
   */
  seatingType: SeatingType;

  /**
   * Indicates if this audience zone is active and available for booking for the event.
   */
  isActive: boolean;

  /**
   * The ID of the `StructureAreaModel` (physical area within the structure)
   * where this audience zone is located/configured.
   */
  areaId: number;

  /**
   * The ID of the template used for this audience zone.
   */
  templateId: number;
}

/**
 * Configuration for an audience zone when creating or updating an event.
 * Matches the EventAudienceZoneConfigDto from the API.
 */
export interface EventAudienceZoneConfigDto {
  /**
   * The ID of the audience zone. Optional, only used for updates.
   */
  id?: number;

  /**
   * The ID of the template to use for this audience zone.
   */
  templateId: number;

  /**
   * The allocated capacity for this audience zone.
   */
  allocatedCapacity: number;
}
