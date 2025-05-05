import {Component, inject, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule et DatePipe
import { MatDialogModule } from '@angular/material/dialog'; // Import MatDialogModule si standalone
import { MatButtonModule } from '@angular/material/button';
import {Router} from '@angular/router'; // Import MatButtonModule si standalone

// Interface pour typer les données injectées
export interface EventDialogData {
  event: CalendarEvent;
  action: string;
}

@Component({
  selector: 'app-event-detail-dialog',
  // Si standalone, ajoutez les imports nécessaires ici
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './event-detail-dialog.component.html',
  styleUrls: ['./event-detail-dialog.component.scss']
})
export class EventDetailDialogComponent {

  router = inject(Router);

  // Injectez MAT_DIALOG_DATA pour recevoir les données et MatDialogRef pour contrôler la modale
  constructor(
    public dialogRef: MatDialogRef<EventDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventDialogData
  ) {}

  // Méthode pour fermer la modale
  closeDialog(): void {
    this.dialogRef.close();
  }

  // Optionnel: si vous aviez un bouton "Voir la fiche complète"
  viewFullEventDetails(): void {
    // Logique pour naviguer ou autre, puis fermer
    this.dialogRef.close();
    this.router.navigateByUrl('admin/events');

    // Peut-être injecter Router ici si besoin de navigation
  }
}
