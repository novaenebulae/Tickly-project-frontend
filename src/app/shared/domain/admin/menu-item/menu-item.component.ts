import { Component, inject, input, signal, computed } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../core/services/domain/user/auth.service';
import { UserRole } from '../../../../core/models/user/user-role.enum';

/**
 * MenuItem component with role-based visibility.
 * Displays menu items based on current user's role permissions.
 */
@Component({
  selector: 'app-menu-item',
  imports: [MatListModule, RouterModule, MatIconModule],
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('500ms ease-in-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({ opacity: 0, height: '0px' })),
      ]),
    ]),
  ],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
})
export class MenuItemComponent {
  // Services injection
  private authService = inject(AuthService);

  // Inputs
  item = input.required<MenuItem>();
  sideNavCollapsed = input(false);

  // Local state
  nestedMenuOpen = signal(false);

  // Access to user role
  readonly currentUserRole = this.authService.userRole;

  /**
   * Computed property to check if the current menu item should be visible
   * based on user's role permissions.
   */
  readonly isItemVisible = computed(() => {
    const item = this.item();
    const userRole = this.currentUserRole();

    // If no role restrictions specified, item is visible to all authenticated users
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return !!userRole; // Visible if user has any role (is authenticated)
    }

    // Check if user's role is in the allowed roles
    return userRole ? item.requiredRoles.includes(userRole) : false;
  });

  /**
   * Computed property to get filtered sub-items based on user permissions.
   */
  readonly visibleSubItems = computed(() => {
    const item = this.item();
    const userRole = this.currentUserRole();

    if (!item.subItems || !userRole) {
      return [];
    }

    return item.subItems.filter(subItem => {
      // If no role restrictions, sub-item is visible
      if (!subItem.requiredRoles || subItem.requiredRoles.length === 0) {
        return true;
      }
      // Check if user's role is in allowed roles
      return subItem.requiredRoles.includes(userRole);
    });
  });

  /**
   * Computed property to check if the item has any visible sub-items.
   */
  readonly hasVisibleSubItems = computed(() => {
    return this.visibleSubItems().length > 0;
  });

  /**
   * Toggles the nested menu state.
   */
  toggleNestedMenu(): void {
    this.nestedMenuOpen.set(!this.nestedMenuOpen());
  }
}

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  subItems?: MenuItem[];
  requiredRoles?: UserRole[];
}
