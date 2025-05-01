import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import RouterModule pour routerLink
import { Subscription, forkJoin, of, throwError } from 'rxjs'; // forkJoin pour charger plusieurs infos
import { catchError, finalize, tap } from 'rxjs/operators';

// Import des modules Angular Material utilisés dans le template HTML (à venir)
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Pour l'indicateur de chargement

// --- Interfaces (à définir ou importer de fichiers partagés) ---
interface StructureInfo {
  id: number;
  name: string;
  address?: string; // Optionnel
  city?: string;    // Optionnel
  zipCode?: string; // Optionnel
  publicUrl?: string; // Optionnel: URL de la page publique
  logoUrl?: string;  // Optionnel: URL du logo
}

// --- Services (Simulés ici, à remplacer par vos vrais services) ---
// import { StructureService } from 'src/app/core/services/structure.service';
// import { TeamService } from 'src/app/core/services/team.service';
// import { ZoneService } from 'src/app/core/services/zone.service';

// Simulation de services
const mockStructureService = {
  getCurrentStructureInfo: () => of<StructureInfo>({
    id: 1,
    name: 'Le Phare Éclectique',
    city: 'Métropole Fictive',
    zipCode: '57000',
    publicUrl: 'https://exemple.com/le-phare', // URL simulée
    logoUrl: 'assets/images/logo-placeholder.png' // Logo simulé
  }).pipe(tap(() => console.log('Structure Info Loaded (Mock)')))
};
const mockTeamService = {
  getTeamMemberCount: () => of(8).pipe(tap(() => console.log('Team Count Loaded (Mock)'))) // 8 membres simulés
};
const mockZoneService = {
  getZoneCount: () => of(6).pipe(tap(() => console.log('Zone Count Loaded (Mock)'))) // 6 zones simulées
  // Simuler une erreur possible:
  // getZoneCount: () => throwError(() => new Error('Failed to load zones count')).pipe(delay(500))
};

@Component({
  selector: 'app-structure-panel', // Sélecteur du composant
  standalone: true,                // Composant autonome
  imports: [                       // Modules requis par le composant et son template
    CommonModule,
    RouterModule, // Pour [routerLink]
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './structure-panel.component.html', // Fichier HTML associé
  styleUrls: ['./structure-panel.component.scss'],   // Fichier SCSS associé
  changeDetection: ChangeDetectionStrategy.OnPush // Stratégie OnPush pour optimiser la détection de changement
})
export class StructurePanelComponent implements OnInit, OnDestroy {

  // --- Injection des services ---
  private router = inject(Router);
  private cdRef = inject(ChangeDetectorRef); // Pour marquer les changements avec OnPush
  // Remplacez les mocks par vos vrais services injectés
  private structureService = mockStructureService; // inject(StructureService);
  private teamService = mockTeamService;       // inject(TeamService);
  private zoneService = mockZoneService;         // inject(ZoneService);

  // --- Propriétés pour le Template ---
  structureInfo: StructureInfo | null = null; // Informations de la structure
  teamMemberCount: number | null = null;    // Compteur membres
  zoneCount: number | null = null;          // Compteur zones
  isLoading: boolean = true;                // Indicateur de chargement initial
  errorLoading: string | null = null;       // Message d'erreur
  private dataSubscription: Subscription | null = null; // Pour gérer la désinscription

  // --- Cycle de vie ---
  ngOnInit(): void {
    this.loadInitialData(); // Lance le chargement des données au démarrage
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe(); // Nettoie l'abonnement à la destruction
  }

  // --- Chargement des Données ---
  loadInitialData(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.cdRef.markForCheck(); // Met à jour l'UI pour montrer le chargement

    // Utilise forkJoin pour lancer plusieurs appels en parallèle
    this.dataSubscription = forkJoin({
      info: this.structureService.getCurrentStructureInfo(),
      teamCount: this.teamService.getTeamMemberCount(),
      zoneCount: this.zoneService.getZoneCount()
    }).pipe(
        // finalize s'exécute toujours, succès ou erreur
        finalize(() => {
          this.isLoading = false; // Arrête le chargement
          this.cdRef.markForCheck(); // Met à jour l'UI
        }),
        // catchError intercepte les erreurs des appels précédents
        catchError(error => {
          console.error("Erreur lors du chargement des données initiales:", error);
          this.errorLoading = "Impossible de charger toutes les informations de la structure.";
          // Retourne un Observable vide ou une valeur par défaut pour ne pas bloquer 'subscribe'
          return of(null);
        })
    ).subscribe(results => {
      // Si catchError retourne null, on ne fait rien ici
      if (results) {
        this.structureInfo = results.info;
        this.teamMemberCount = results.teamCount;
        this.zoneCount = results.zoneCount;
        console.log("Données initiales chargées:", results);
      }
      // Marquer pour la détection de changement car les données ont été mises à jour
      this.cdRef.markForCheck();
    });
  }

  // --- Méthodes d'Action (appelées depuis le HTML) ---

  // Navigue vers la page d'édition des informations de la structure
  navigateToEditInfo(): void {
    // Définissez la route '/admin/structure/edit' ou ouvrez une modale
    this.router.navigate(['/admin/structure/edit'])
    // Exemple: this.router.navigate(['/admin/structure/edit']);
    // Ou: this.dialog.open(EditStructureInfoDialogComponent, { data: this.structureInfo });
  }

  // Méthode pour ouvrir la page publique (déjà gérée par <a> dans le HTML mais pourrait avoir une logique ici si besoin)
  openPublicPage(): void {
    if (this.structureInfo?.publicUrl) {
      window.open(this.structureInfo.publicUrl, '_blank');
    } else {
      console.warn("Aucune URL publique définie pour cette structure.");
      // Afficher une notification à l'utilisateur ?
    }
  }

}
