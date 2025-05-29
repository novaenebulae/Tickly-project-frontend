import {Component, Input, signal, computed, inject, effect} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {RouterModule} from '@angular/router';
import {MenuItemComponent} from '../../domain/admin/menu-item/menu-item.component';
import {AuthService} from '../../../core/services/domain/user/auth.service';
import {StructureService} from '../../../core/services/domain/structure/structure.service';
import {MenuItem} from '../../domain/admin/menu-item/menu-item.component';
import {UserRole} from '../../../core/models/user/user-role.enum';

@Component({
  selector: 'app-admin-sidenav',
  imports: [
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    RouterModule,
    MenuItemComponent
  ],
  templateUrl: './admin-sidenav.component.html',
  styleUrl: './admin-sidenav.component.scss',
})
export class AdminSidenavComponent {
  // ✅ Services injectés
  private authService = inject(AuthService);
  private structureService = inject(StructureService);

  // ✅ État du sidenav (conservé tel quel)
  sideNavCollapsed = signal(false);

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  // ✅ Signaux des services
  readonly currentUser = this.authService.currentUser;
  readonly structureId = this.authService.structureId;
  readonly currentStructureDetails = this.structureService.currentStructureDetails;

  // ✅ Informations de la structure basées sur les services
  readonly structureName = computed(() => {
    const structure = this.currentStructureDetails();
    return structure?.name || 'Ma Structure';
  });

  readonly structureLogoUrl = computed(() => {
    const structure = this.currentStructureDetails();
    // Adapter selon votre modèle StructureModel
    return structure?.logoUrl || 'images/example_structure_logo.jpg';
  });

  menuItems = signal<MenuItem[]>([
    {
      icon: 'dashboard',
      label: 'Tableau de bord',
      route: 'dashboard',
      // Accessible à tous les rôles admin
    },
    {
      icon: 'home',
      label: 'Structure',
      route: 'structure',
      subItems: [
        {
          icon: 'groups',
          label: 'Équipe',
          route: 'team-management',
          requiredRoles: [UserRole.STRUCTURE_ADMINISTRATOR] // Seul STRUCTURE_ADMINISTRATOR
        },
        {
          icon: 'zoom_out_map',
          label: 'Zones',
          route: 'zone-management',
          requiredRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE]
        },
        {
          icon: 'edit_note',
          label: 'Édition infos',
          route: 'edit',
          requiredRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE]
        },
      ],
    },
    {
      icon: 'event',
      label: 'Événements',
      route: 'events',
      subItems: [
        {
          icon: 'calendar_month',
          label: 'Calendrier',
          route: 'calendar',
          // Accessible à tous les rôles admin
        },
        {
          icon: 'add',
          label: 'Créer un événement',
          route: 'create',
          requiredRoles: [UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE]
        },
      ],
    },
    {
      icon: 'query_stats',
      label: 'Statistiques',
      route: 'stats',
      // Accessible à tous les rôles admin
    },
  ]);
  // ✅ Taille du logo (conservé tel quel)
  organisationPicSize = computed(() =>
    this.sideNavCollapsed() ? '32' : '100'
  );

  constructor() {
    // ✅ Effect pour charger les détails de la structure si nécessaire
    effect(() => {
      const structureId = this.structureId();
      const currentStructure = this.currentStructureDetails();

      if (structureId && !currentStructure) {
        // Charger les détails de la structure si on a l'ID mais pas les détails
        this.structureService.getStructureById(structureId).subscribe({
          error: (error) => {
            console.error('Erreur lors du chargement des détails de la structure:', error);
          }
        });
      }
    });
  }
}
