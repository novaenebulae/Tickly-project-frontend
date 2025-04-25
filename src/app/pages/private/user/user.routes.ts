import { Routes } from '@angular/router';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { AuthComponent } from '../../public/auth/auth.component';
import { LoginGuard } from '../../../core/guards/login.guard';

export const userRoutes: Routes = [
  {
    path: '',
    canActivate: [LoginGuard],
    component: UserLayoutComponent,
  },
];
