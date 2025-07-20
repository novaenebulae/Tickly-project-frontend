import {Component, computed, inject, Input, signal} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {RouterModule} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MenuItem, MenuItemComponent} from '../../domain/admin/menu-item/menu-item.component';
import {UserStructureService} from '../../../core/services/domain/user-structure/user-structure.service';
import {AuthService} from '../../../core/services/domain/user/auth.service';
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
    MenuItemComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-sidenav.component.html',
  styleUrl: './admin-sidenav.component.scss',
})
export class AdminSidenavComponent {
  private userStructureService = inject(UserStructureService);
  private authService = inject(AuthService);

  protected structureInfos = this.userStructureService.userStructure;
  protected isLoading = this.userStructureService.isLoading;
  protected currentUserRole = computed(() => this.authService.currentUser()?.role);

  sideNavCollapsed = signal(false);

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  // Helper method to check if user has one of the specified roles
  private hasRole(roles: UserRole[]): boolean {
    const userRole = this.currentUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  // Helper method to get the appropriate label based on user role
  private getEditLabel(): string {
    const userRole = this.currentUserRole();
    if (userRole === UserRole.ORGANIZATION_SERVICE || userRole === UserRole.RESERVATION_SERVICE) {
      return 'Détails';
    }
    return 'Édition';
  }

  menuItems = computed<MenuItem[]>(() => {
    // Base menu items that all staff users can see
    const items: MenuItem[] = [
      {
        icon: 'dashboard',
        label: 'Tableau de bord',
        route: 'dashboard',
      }
    ];

    // Structure menu item with filtered subitems
    const structureSubItems: MenuItem[] = [];

    // Edit/Details menu item - available to all staff but with different labels
    structureSubItems.push({
      icon: 'edit',
      label: this.getEditLabel(), // Conditionally set label based on role
      route: 'edit',
    });

    // Medias menu item - available to all staff including RESERVATION_SERVICE
    structureSubItems.push({
      icon: 'photo',
      label: 'Médias',
      route: 'medias',
    });

    // Team menu item - only for STRUCTURE_ADMINISTRATOR and ORGANIZATION_SERVICE
    if (this.hasRole([UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE])) {
      structureSubItems.push({
        icon: 'groups',
        label: 'Équipe',
        route: 'team',
      });
    }

    // Areas menu item - available to all staff including RESERVATION_SERVICE
    structureSubItems.push({
      icon: 'zoom_out_map',
      label: 'Espaces',
      route: 'areas',
    });

    // Add structure menu item if it has subitems
    if (structureSubItems.length > 0) {
      items.push({
        icon: 'home',
        label: 'Structure',
        route: 'structure',
        subItems: structureSubItems,
      });
    }

    // Events menu item with filtered subitems
    const eventsSubItems: MenuItem[] = [];

    // Calendar menu item - available to all staff
    eventsSubItems.push({
      icon: 'calendar_month',
      label: 'Calendrier',
      route: 'calendar',
    });

    // Create event menu item - only for STRUCTURE_ADMINISTRATOR and ORGANIZATION_SERVICE
    if (this.hasRole([UserRole.STRUCTURE_ADMINISTRATOR, UserRole.ORGANIZATION_SERVICE])) {
      eventsSubItems.push({
        icon: 'add',
        label: 'Créer un événement',
        route: 'create',
      });
    }

    // Add events menu item if it has subitems
    if (eventsSubItems.length > 0) {
      items.push({
        icon: 'event',
        label: 'Événements',
        route: 'events',
        subItems: eventsSubItems,
      });
    }

    return items;
  });

  organisationPicSize = computed(() =>
    this.sideNavCollapsed() ? '32' : '100'
  );
}
