interface Zone {
  id: number;
  name: string;
  maxCapacity: number;
  isActive: boolean;
}

export interface ZoneDialogData {
  zone: Zone | null; // La zone à modifier, ou null si c'est un ajout
}
