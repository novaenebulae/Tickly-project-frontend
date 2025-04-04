import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AppStore } from '../../app.store';
import { inject } from '@angular/core';

export const redirectLoginIfNotAuthenticated: CanActivateFn = () => {
  const user = inject(AppStore).user();
  const router = inject(Router);

  if (user) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const redirectLoginIfAuthenticated: CanActivateFn = () => {
  const user = inject(AppStore).user(); // Vérifie si l'utilisateur est connecté
  const router = inject(Router);

  if (user) {
    // Redirige vers le tableau de bord si l'utilisateur est déjà connecté
    router.navigate(['/admin/dashboard']);
    return false; // Empêche l'accès à /login
  }
  return true; // Autorise l'accès à /login si non connecté
};
