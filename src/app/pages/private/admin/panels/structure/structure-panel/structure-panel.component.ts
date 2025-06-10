import { Component, OnInit, inject, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { StructureService } from '../../../../../../core/services/domain/structure/structure.service';
import { UserStructureService } from '../../../../../../core/services/domain/user-structure/user-structure.service';
import { NotificationService } from '../../../../../../core/services/domain/utilities/notification.service';

// Models
import { StructureModel } from '../../../../../../core/models/structure/structure.model';
import { StructureAreaModel } from '../../../../../../core/models/structure/structure-area.model';
import {TeamManagementService} from '../../../../../../core/services/domain/team-management/team-management.service';

@Component({
  selector: 'app-structure-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatChipsModule
  ],
  templateUrl: './structure-panel.component.html',
  styleUrls: ['./structure-panel.component.scss']
})
export class StructurePanelComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private structureService = inject(StructureService);
  private userStructureService = inject(UserStructureService);
  private notification = inject(NotificationService);
  private destroy$ = new Subject<void>();
  private teamManagementService = inject(TeamManagementService);

  // ✅ Utilisation des signaux des services
  private readonly userStructure = this.userStructureService.userStructure;
  protected userStructureData = this.userStructureService.userStructure();

  protected readonly isLoadingStructure = this.userStructureService.isLoading;
  protected readonly hasStructure = this.userStructureService.hasStructure;
  protected readonly structureAreas = this.structureService.currentStructureAreas;

  // ✅ Signaux locaux pour les statistiques
  private teamCountSig = signal<number>(0);
  private eventCountSig = signal<number>(0);


  // ✅ Computed properties pour l'UI
  protected readonly teamCount = computed(() => this.teamCountSig());
  protected readonly eventCount = computed(() => this.eventCountSig());
  protected readonly areaCount = computed(() => this.structureAreas().length);

  protected readonly structureStatus = computed(() => {
    const structure = this.userStructure();
    if (!structure) return 'no-structure';

    const areas = this.structureAreas().length;
    const team = this.teamCount();

    if (areas === 0) return 'needs-setup';
    if (team <= 1) return 'needs-team';
    return 'ready';
  });

  protected readonly statusConfig = computed(() => {
    const status = this.structureStatus();
    switch (status) {
      case 'no-structure':
        return {
          label: 'Aucune structure',
          color: 'warn',
          icon: 'error_outline',
          description: 'Vous devez créer une structure'
        };
      case 'needs-setup':
        return {
          label: 'Configuration requise',
          color: 'accent',
          icon: 'build',
          description: 'Ajoutez des zones à votre structure'
        };
      case 'needs-team':
        return {
          label: 'Équipe incomplète',
          color: 'primary',
          icon: 'group_add',
          description: 'Invitez des membres à votre équipe'
        };
      case 'ready':
        return {
          label: 'Opérationnelle',
          color: 'primary',
          icon: 'check_circle',
          description: 'Votre structure est prête'
        };
      default:
        return { label: 'Inconnu', color: 'warn', icon: 'help', description: '' };
    }
  });

  ngOnInit(): void {
    this.loadStructureData();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ✅ Charge les données de la structure utilisateur
   */
  private loadStructureData(): void {
    // Surveiller les changements de structure pour charger les areas
    this.userStructureData = this.userStructure()
  }

  /**
   * ✅ Charge les statistiques (simulées pour le moment)
   */
  private loadStatistics(): void {
    console.log(this.teamManagementService.teamMembers().length);
    this.teamCountSig.set(this.teamManagementService.teamMembers().length);
    this.eventCountSig.set(this.userStructureData?.eventsCount!)

  }

  /**
   * ✅ Rafraîchit toutes les données
   */
  refreshData(): void {
    this.userStructureService.refreshUserStructure().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.loadStatistics();
        this.notification.displayNotification('Données mises à jour', 'valid');
      },
      error: (error) => {
        this.notification.displayNotification('Erreur lors de la mise à jour', 'error');
      }
    });
  }

  /**
   * ✅ Navigation vers l'édition de structure
   */
  navigateToEdit(): void {
    this.router.navigate(['/admin/structure/edit']);
  }

  /**
   * ✅ Navigation vers la gestion d'équipe
   */
  navigateToTeam(): void {
    this.router.navigate(['/admin/structure/team']);
  }

  /**
   * ✅ Navigation vers la gestion des zones
   */
  navigateToAreas(): void {
    this.router.navigate(['/admin/structure/areas']);
  }

  /**
   * ✅ Navigation vers les événements
   */
  navigateToEvents(): void {
    this.router.navigate(['/admin/events']);
  }

  /**
   * ✅ Ouvre la page publique de la structure
   */
  openPublicPage(): void {
    const structure = this.userStructure();
    if (structure?.id) {
      // TODO: Remplacer par l'URL réelle de la page publique
      const publicUrl = `/structures/${structure.id}`;
      window.open(publicUrl, '_blank');
    }
  }

  /**
   * ✅ Obtient la couleur en fonction du nombre
   */
  getCountColor(count: number, thresholds: { low: number; medium: number }): string {
    if (count === 0) return 'warn';
    if (count <= thresholds.low) return 'accent';
    if (count <= thresholds.medium) return 'primary';
    return 'primary';
  }

  /**
   * ✅ Formate l'adresse de la structure
   */
  getFormattedAddress(): string {
    const structure = this.userStructure();
    if (!structure?.address) return 'Adresse non définie';

    const { street, city, zipCode, country } = structure.address;
    const parts = [street, city, country].filter(Boolean);
    return parts.join(', ');
  }
}
