import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
} from '@angular/material/slide-toggle'; // Importer MatSlideToggleChange
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Pour les dialogues
import { MatTooltipModule } from '@angular/material/tooltip';

// --- Interface pour typer les données d'une Zone ---
interface Zone {
  id: number; // Identifiant unique
  name: string; // Nom de la zone
  maxCapacity: number; // Capacité maximale
  isActive: boolean; // Statut actif/inactif
}

// --- Composant pour la boîte de dialogue (à créer dans un fichier séparé) ---
// import { ZoneEditDialogComponent } from './zone-edit-dialog/zone-edit-dialog.component';
// import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component'; // Exemple

@Component({
  selector: 'app-zone-management', // Sélecteur CSS pour utiliser ce composant
  standalone: true, // Composant autonome (Angular 14+)
  imports: [
    // Importation des modules requis par le template
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './zone-management.component.html', // Chemin vers le fichier HTML
  styleUrls: ['./zone-management.component.scss'], // Chemin vers le fichier CSS/SCSS
})
export class ZoneManagementComponent implements OnInit, AfterViewInit {
  // --- Colonnes affichées dans le tableau ---
  // Doivent correspondre aux `matColumnDef` dans le HTML
  displayedColumns: string[] = ['name', 'maxCapacity', 'status', 'actions'];

  // --- Source de données pour le tableau Material ---
  dataSource: MatTableDataSource<Zone>;

  // --- Références aux éléments MatSort et MatPaginator du template ---
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // --- Données mockées (remplacer par un appel service) ---
  private zones: Zone[] = [
    { id: 1, name: 'Scène Principale', maxCapacity: 1000, isActive: true },
    { id: 2, name: 'Zone VIP', maxCapacity: 50, isActive: true },
    { id: 3, name: 'Espace Bar Gauche', maxCapacity: 150, isActive: false },
    { id: 4, name: 'Fosse Avant', maxCapacity: 500, isActive: true },
    { id: 5, name: 'Gradins Section A', maxCapacity: 200, isActive: true },
    { id: 6, name: 'Espace Chill', maxCapacity: 80, isActive: true },
  ];

  // --- Injection du service MatDialog pour ouvrir des boîtes de dialogue ---
  constructor(
    public dialog: MatDialog /*, private zoneService: ZoneService */
  ) {
    // Initialisation de la source de données avec les données mockées
    this.dataSource = new MatTableDataSource(this.zones);
  }

  // --- Hook de cycle de vie : exécuté après l'initialisation du composant ---
  ngOnInit(): void {
    // --- TODO: Remplacer par un appel service pour charger les vraies données ---
    // this.loadZones();
  }

  // --- Hook de cycle de vie : exécuté après l'initialisation de la vue (pour @ViewChild) ---
  ngAfterViewInit(): void {
    // Association du paginator et du sort à la source de données
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /* --- Méthode pour charger les zones (depuis un service par exemple) ---
  loadZones(): void {
    this.zoneService.getZones().subscribe(data => {
      this.zones = data;
      this.dataSource.data = this.zones;
    });
  }
  */

  // --- Applique le filtre entré par l'utilisateur sur le tableau ---
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // Applique le filtre (en ignorant la casse et les espaces superflus)
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Si un paginator est utilisé, retourne à la première page lors du filtrage
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // --- Ouvre la boîte de dialogue pour ajouter ou modifier une zone ---
  openZoneDialog(zoneToEdit?: Zone): void {
    console.log('Ouverture dialogue pour :', zoneToEdit); // Log de débogage

    // Configuration de la boîte de dialogue
    const dialogRef = this.dialog.open(
      /* ZoneEditDialogComponent */ null as any,
      {
        // Remplacez null par votre composant de dialogue
        width: '450px', // Largeur de la dialogue
        disableClose: true, // Empêche la fermeture en cliquant en dehors
        data: { zone: zoneToEdit ? { ...zoneToEdit } : null }, // Passe une copie de la zone à éditer ou null si ajout
      }
    );

    // --- Après la fermeture de la dialogue ---
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialogue fermée, résultat:', result); // Log de débogage

      // Si l'utilisateur a sauvegardé des données (result contient la zone ajoutée/modifiée)
      if (result) {
        if (zoneToEdit) {
          // --- Mode Modification ---
          const index = this.zones.findIndex((z) => z.id === result.id);
          if (index > -1) {
            this.zones[index] = result; // Met à jour la zone dans le tableau local
            // --- TODO: Appel API pour sauvegarder la modification en base de données ---
            console.log('Appel API UPDATE pour zone ID:', result.id);
          }
        } else {
          // --- Mode Ajout ---
          // Simule un ID (à remplacer par l'ID retourné par le backend)
          result.id = Math.max(...this.zones.map((z) => z.id), 0) + 1;
          result.isActive = result.isActive ?? true; // Valeur par défaut si non fournie
          this.zones.push(result); // Ajoute la nouvelle zone au tableau local
          // --- TODO: Appel API pour sauvegarder la nouvelle zone en base de données ---
          console.log('Appel API CREATE pour nouvelle zone:', result);
        }
        // Met à jour la source de données du tableau pour refléter les changements
        this.dataSource.data = [...this.zones]; // Crée une nouvelle référence pour déclencher la mise à jour
      }
    });
  }

  // --- Modifie le statut (actif/inactif) d'une zone ---
  toggleZoneStatus(zone: Zone, event: MatSlideToggleChange): void {
    const isActive = event.checked;
    console.log(`Changement statut pour zone ${zone.id} vers ${isActive}`); // Log de débogage

    // Recherche de la zone dans les données locales
    const index = this.zones.findIndex((z) => z.id === zone.id);
    if (index > -1) {
      this.zones[index].isActive = isActive; // Met à jour le statut localement

      // Met à jour la source de données (important pour la réactivité visuelle immédiate)
      // Bien que non strictement nécessaire ici car l'objet zone est muté, c'est une bonne pratique
      // this.dataSource.data = [...this.zones];

      // --- TODO: Appel API pour mettre à jour le statut en base de données ---
      console.log(
        'Appel API UPDATE STATUS pour zone ID:',
        zone.id,
        ' Nouveau statut:',
        isActive
      );
      // Gérer les erreurs potentielles de l'API (ex: remettre l'état précédent si l'API échoue)
      /*
      this.zoneService.updateZoneStatus(zone.id, isActive).subscribe({
        next: () => console.log('Statut mis à jour avec succès'),
        error: (err) => {
          console.error('Erreur maj statut:', err);
          // Rollback : remettre l'état précédent en cas d'erreur API
          event.source.checked = !isActive; // Remet le toggle à son état précédent
          this.zones[index].isActive = !isActive; // Remet le statut dans les données locales
          // Afficher un message d'erreur à l'utilisateur (ex: avec MatSnackBar)
        }
      });
      */
    }
  }

  // --- Supprime une zone (après confirmation) ---
  deleteZone(zoneToDelete: Zone): void {
    console.log('Demande suppression pour zone:', zoneToDelete); // Log de débogage

    // --- Étape 1 : Confirmation ---
    // Ouvrir une dialogue de confirmation générique
    const dialogRef = this.dialog.open(
      /* ConfirmationDialogComponent */ null as any,
      {
        // Remplacez null par votre composant de confirmation
        width: '350px',
        data: {
          title: 'Confirmation de suppression',
          message: `Êtes-vous sûr de vouloir supprimer la zone "${zoneToDelete.name}" ? Cette action est irréversible.`,
        },
      }
    );

    // --- Étape 2 : Traitement après confirmation ---
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        console.log(
          'Confirmation reçue, suppression zone ID:',
          zoneToDelete.id
        );

        // Filtrer le tableau local pour retirer la zone
        this.zones = this.zones.filter((z) => z.id !== zoneToDelete.id);

        // Mettre à jour la source de données du tableau
        this.dataSource.data = this.zones; // Pas besoin de [...this.zones] ici car filter crée un nouveau tableau

        // --- TODO: Appel API pour supprimer la zone en base de données ---
        console.log('Appel API DELETE pour zone ID:', zoneToDelete.id);
        /*
        this.zoneService.deleteZone(zoneToDelete.id).subscribe({
          next: () => console.log('Zone supprimée avec succès'),
          error: (err) => {
            console.error('Erreur suppression:', err);
            // Réinsérer la zone localement si l'API échoue (Rollback)
            this.zones.push(zoneToDelete); // Peut nécessiter de trier à nouveau
            this.dataSource.data = [...this.zones];
            // Afficher un message d'erreur
          }
        });
        */
      } else {
        console.log('Suppression annulée.');
      }
    });
  }
}
