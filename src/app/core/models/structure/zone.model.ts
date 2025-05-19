// src/app/core/models/structure/zone.model.ts
export interface Zone {
  id: number;
  name: string;
  maxCapacity: number;
  isActive: boolean;
}

export interface ZoneDialogData {
  zone: Zone | null;
}
