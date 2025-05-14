import { Routes } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';
import { AuthComponent } from './pages/auth/auth/auth.component';
import { adminRoutes } from './pages/private/admin/admin.routes';
import { userRoutes } from './pages/private/user/user.routes';
import { RegisterPageComponent } from './pages/auth/register/register-page.component';
import { PublicGuard } from './core/guards/public.guard';
import { StructureCreationComponent } from './pages/private/admin/structure-creation/structure-creation.component';
import {PublicLayoutComponent} from './pages/public/public-layout/public-layout.component';
import {publicRoutes} from './pages/public/public.routes';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [PublicGuard],
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [PublicGuard],
  },
  {
    path: 'create-structure',
    component: StructureCreationComponent,
    // canActivate: [LoginGuard],
  },
  {
    path: 'user',
    // canActivate: [LoginGuard],
    children: userRoutes,
  },
  {
    path: 'admin',
    // canActivate: [LoginGuard],
    children: adminRoutes,
  },
  {
    path: '',
    children: publicRoutes,
  },
];
