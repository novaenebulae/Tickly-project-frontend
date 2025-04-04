import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface User {
  email: string;
  name: string;
  image?: string;
}

type AppState = {
  user: User | undefined;
};

const intialState: AppState = {
  user: undefined,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(intialState),
  withMethods((store, router = inject(Router)) => ({
    login: () => {
      patchState(store, { user: { email: 'mail', name: 'lucas' } });
      router.navigate(['/admin/dashboard']); // Redirige après connexion
    },
    logout: () => {
      patchState(store, { user: undefined });
      router.navigate(['/login']); // Redirige après déconnexion
    },
  }))
);

