import { Routes } from '@angular/router';
import { AuthComponent } from '../../../core/auth/auth.component';
import { LoginGuard } from '../../../core/guards/login.guard';
import { UserLayoutComponent } from './user-layout/user-layout.component';

export const userRoutes: Routes = [
  {
    path: '',
    canActivate: [LoginGuard],
    component: UserLayoutComponent,
  },
];
