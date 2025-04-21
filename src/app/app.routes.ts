import { Routes } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';
import { AuthComponent } from './core/auth/auth.component';
import { adminRoutes } from './pages/private/admin/admin.routes';
import { userRoutes } from './pages/private/user/user.routes';
import { RegisterPageComponent } from './pages/public/register/register-page/register-page.component';
import { PublicGuard } from './core/guards/public.guard';
import { HomePageComponent } from './pages/public/home/home-page/home-page.component';
import { StructureCreationComponent } from './pages/private/admin/structure-creation/structure-creation.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
  },
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
    canActivate: [LoginGuard],
  },
  {
    path: 'user',
    canActivate: [LoginGuard],
    children: userRoutes,
  },
  {
    path: 'admin',
    canActivate: [LoginGuard],
    children: adminRoutes,
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
