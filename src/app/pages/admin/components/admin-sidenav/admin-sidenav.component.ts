import { Component, computed, Input, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { MenuItemComponent } from "../menu-item/menu-item.component";

export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
};

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
      route: 'organisation',
      subItems: [
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
