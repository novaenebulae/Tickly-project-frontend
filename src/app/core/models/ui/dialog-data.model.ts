// src/app/core/models/ui/dialog-data.model.ts
import { AreaModel } from '../structure/area.model';
import { EventSeatingZone } from '../event/seating.model';

export interface ZoneDialogData {
  zone: AreaModel | null;
}

export interface SeatingZoneDialogData {
  seatingZone: EventSeatingZone | null;
  areaId: number;
}
