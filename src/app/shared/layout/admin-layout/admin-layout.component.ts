import {Component, computed, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {AdminSidenavComponent} from '../admin-sidenav/admin-sidenav.component';
import {RouterModule} from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import {AuthService} from '../../../core/services/domain/user/auth.service';
import {UserService} from '../../../core/services/domain/user/user.service';

@Component({
  selector: 'app-admin-layout',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    AdminSidenavComponent,
    RouterModule,
    MatMenuModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  collapsed = signal(false);
  sidenavWidth = computed(() => (this.collapsed() ? '70px' : '250px'));

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;

}
