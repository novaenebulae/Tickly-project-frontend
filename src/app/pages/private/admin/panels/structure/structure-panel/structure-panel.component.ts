import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';

// Angular Material
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';

// Services
import {UserStructureService} from '../../../../../../core/services/domain/user-structure/user-structure.service';
import {NotificationService} from '../../../../../../core/services/domain/utilities/notification.service';

// Models
import {TeamManagementService} from '../../../../../../core/services/domain/team-management/team-management.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  styleUrls: ['./structure-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructurePanelComponent implements OnInit {
  private router = inject(Router);
  private userStructureService = inject(UserStructureService);
  private notification = inject(NotificationService);
  private teamManagementService = inject(TeamManagementService);
  private destroyRef = inject(DestroyRef);

  // ✅ Utilisation des signaux des services
  private readonly userStructure = this.userStructureService.userStructure;
  protected userStructureData = this.userStructureService.userStructure();

  protected readonly isLoadingStructure = this.userStructureService.isLoading;
  protected readonly structureAreas = this.userStructureService.userStructureAreas;

  // ✅ Signaux locaux pour les statistiques
  private teamCountSig = signal<number>(0);
  private eventCountSig = signal<number>(0);


  // ✅ Computed properties pour l'UI
  protected readonly teamCount = computed(() => this.teamCountSig());

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

  /**
   * ✅ Charge les données de la structure utilisateur
   */
  private loadStructureData(): void {
    // Surveiller les changements de structure pour charger les areas
    this.userStructureData = this.userStructure();

    // Charger les espaces de la structure
    this.userStructureService.loadUserStructureAreas().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  /**
   * ✅ Charge les statistiques
   */
  private loadStatistics(): void {
    // Charger le nombre de membres d'équipe
    this.teamManagementService.loadTeamMembers().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (members) => {
        this.teamCountSig.set(members.length);
      },
      error: () => {
        this.teamCountSig.set(0);
      }
    });

    // Charger le nombre d'événements
    this.userStructureService.getUserStructureEvents(true).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (events) => {
        this.eventCountSig.set(events.length);
      },
      error: () => {
        this.eventCountSig.set(0);
      }
    });
  }

  /**
   * ✅ Rafraîchit toutes les données
   */
  refreshData(): void {
    this.userStructureService.refreshUserStructure().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.loadStructureData();
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
      const publicUrl = `/structures/${structure.id}`;
      window.open(publicUrl, '_blank');
    }
  }

}
