import { AppStore } from './../../../app.store';
import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {MatSidenavModule } from '@angular/material/sidenav'
import { AdminSidenavComponent } from "../components/admin-sidenav/admin-sidenav.component";
import { RouterModule } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';


@Component({
  selector: 'app-admin-layout',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    AdminSidenavComponent,
    RouterModule,
    MatMenuModule
  ],

  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {

  appStore = inject(AppStore);
  collapsed = signal(false);

  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));
}
