import { Routes } from '@angular/router';
import { SpectatorLayoutComponent } from './spectator-layout/spectator-layout.component';
import { AuthComponent } from '../../core/auth/auth.component';
import { LoginGuard } from '../../core/guards/login.guard';

export const spectatorRoutes: Routes = [
  {
    path: '',
    canActivate: [LoginGuard],
    component: SpectatorLayoutComponent,
  },
];
