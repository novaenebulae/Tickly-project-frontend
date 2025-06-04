import {Component, computed, inject, Input, signal} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MenuItem, MenuItemComponent} from '../../domain/admin/menu-item/menu-item.component';
import {StructureService} from '../../../core/services/domain/structure/structure.service';
import {UserStructureService} from '../../../core/services/domain/user-structure/user-structure.service';

@Component({
  selector: 'app-admin-sidenav',
  imports: [
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    RouterModule,
    MenuItemComponent,
    MatProgressSpinnerModule
],
  templateUrl: './admin-sidenav.component.html',
  styleUrl: './admin-sidenav.component.scss',
})
export class AdminSidenavComponent {
  private userStructureService = inject(UserStructureService);

  protected structureInfos = this.userStructureService.userStructure;
  protected isLoading = this.userStructureService.isLoading;

  sideNavCollapsed = signal(false);

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }
  menuItems = signal<MenuItem[]>([
    {
      icon: 'dashboard',
      label: 'Tableau de bord',
      route: 'dashboard',
    },
    {
      icon: 'home',
      label: 'Structure',
      route: 'structure',
      subItems: [
        {
          icon: 'edit',
          label: 'Édition',
          route: 'edit',
        },
        {
          icon: 'groups',
          label: 'Équipe',
          route: 'team',
        },
        {
          icon: 'zoom_out_map',
          label: 'Espaces',
          route: 'areas',
        },
      ],
    },
    {
      icon: 'event',
      label: 'Événements',
      route: 'events',
      subItems: [
        {
          icon: 'add',
          label: 'Créer un événement',
          route: 'create',
        },
        {
          icon: 'calendar_month',
          label: 'Calendrier',
          route: 'calendar',
        },
      ],
    },
    {
      icon: 'query_stats',
      label: 'Statistiques',
      route: 'stats',
    },
  ]);

  organisationPicSize = computed(() =>
    this.sideNavCollapsed() ? '32' : '100'
  );
}
