import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // Ajouté
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Module principal MatDialog
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { ZoneDialogData } from '../../../../../../core/models/ZoneDialogData.interface';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../../../shared/ui/confirmation-dialog/confirmation-dialog.component';
import { ZoneEditDialogComponent } from './zone-edit-dialog/zone-edit-dialog.component';

// Interface Zone (répétée ou importée d'un fichier partagé)
interface Zone {
  id: number;
  name: string;
  maxCapacity: number;
  isActive: boolean;
}

@Component({
  selector: 'app-zone-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Ajouté
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule, // Important pour que le service MatDialog soit injectable
    MatTooltipModule,
    MatCardModule,
    // Pas besoin d'importer les composants de dialogue ici car ils sont ouverts via le service MatDialog
  ],
  templateUrl: './zone-management.component.html',
  styleUrls: ['./zone-management.component.scss'],
})
export class ZoneManagementComponent implements OnInit, AfterViewInit {
  // Colonnes à afficher dans le tableau
  displayedColumns: string[] = ['name', 'maxCapacity', 'status', 'actions'];
  // Source de données pour le tableau
  dataSource: MatTableDataSource<Zone>;

  // Accès aux éléments Paginator, Sort et Input du template
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filterInput') filterInput!: HTMLInputElement;

  // Données locales (à remplacer par un service)
  private zones: Zone[] = [
    { id: 1, name: 'Scène Principale', maxCapacity: 1000, isActive: true },
    { id: 2, name: 'Zone VIP', maxCapacity: 50, isActive: true },
    { id: 3, name: 'Espace Bar Gauche', maxCapacity: 150, isActive: false },
    { id: 4, name: 'Fosse Avant', maxCapacity: 500, isActive: true },
    { id: 5, name: 'Gradins Section A', maxCapacity: 200, isActive: true },
    { id: 6, name: 'Espace Chill', maxCapacity: 80, isActive: true },
  ];

  // Injection du service MatDialog
  constructor(
    public dialog: MatDialog /*, private zoneService: ZoneService */
  ) {
    this.dataSource = new MatTableDataSource(this.zones);
  }

  ngOnInit(): void {
    // TODO: Charger les données initiales depuis un service
  }

  // Après que la vue soit initialisée, lier paginator et sort
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Appliquer le filtre sur la source de données
  applyFilter(event: Event | string): void {
    const filterValue =
      typeof event === 'string'
        ? event
        : (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Effacer le contenu du champ de filtre
  clearFilter(): void {
    if (this.filterInput) {
      this.filterInput.value = ''; // Vide l'input
    }
    this.applyFilter(''); // Réapplique un filtre vide
  }

  // Ouvrir le dialogue d'ajout/modification de zone
  openZoneDialog(zoneToEdit?: Zone): void {
    const dialogRef = this.dialog.open<
      ZoneEditDialogComponent,
      ZoneDialogData,
      Zone
    >(ZoneEditDialogComponent, {
      // Typage fort
      width: '450px',
      disableClose: true,
      data: { zone: zoneToEdit ? { ...zoneToEdit } : null }, // Copie ou null
    });

    dialogRef.afterClosed().subscribe((result: Zone | undefined) => {
      if (result) {
        // Si des données valides sont retournées
        if (zoneToEdit) {
          // Mode Modification
          const index = this.zones.findIndex((z) => z.id === result.id);
          if (index > -1) {
            this.zones[index] = result; // Remplacer l'ancienne zone par la nouvelle
            console.log('TODO: Appel API UPDATE pour zone ID:', result.id);
          }
        } else {
          // Mode Ajout
          // Assigner un ID temporaire (le backend devrait le fournir)
          result.id = Math.max(...this.zones.map((z) => z.id), 0) + 1;
          // Assigner un statut par défaut si non défini (pourrait être fait dans le dialogue aussi)
          result.isActive = result.isActive ?? true;
          this.zones.push(result); // Ajouter au tableau local
          console.log('TODO: Appel API CREATE pour nouvelle zone:', result);
        }
        this.dataSource.data = [...this.zones]; // Mettre à jour le tableau Material
      }
    });
  }

  // Basculer le statut actif/inactif d'une zone
  toggleZoneStatus(zone: Zone, event: MatSlideToggleChange): void {
    const isActive = event.checked; // Nouvel état du toggle
    const index = this.zones.findIndex((z) => z.id === zone.id);
    if (index > -1) {
      this.zones[index].isActive = isActive; // Mettre à jour localement
      console.log(
        'TODO: Appel API UPDATE STATUS zone ID:',
        zone.id,
        ' => ',
        isActive
      );
      // En cas d'erreur API, inverser le changement :
      // event.source.checked = !isActive; this.zones[index].isActive = !isActive;
    }
  }

  // Ouvrir le dialogue de confirmation avant de supprimer une zone
  deleteZone(zoneToDelete: Zone): void {
    const dialogRef = this.dialog.open<
      ConfirmationDialogComponent,
      ConfirmationDialogData,
      boolean
    >(ConfirmationDialogComponent, {
      // Typage fort
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer la zone "${zoneToDelete.name}" ? Cette action est irréversible.`,
        confirmButtonText: 'Supprimer',
        cancelButtonText: 'Annuler',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        // Si l'utilisateur a cliqué sur "Supprimer"
        this.zones = this.zones.filter((z) => z.id !== zoneToDelete.id); // Retirer du tableau local
        this.dataSource.data = this.zones; // Mettre à jour le tableau Material
        console.log('TODO: Appel API DELETE pour zone ID:', zoneToDelete.id);
        // En cas d'erreur API, réinsérer localement et notifier l'utilisateur
      }
    });
  }
}
