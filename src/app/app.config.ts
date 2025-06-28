import {ApplicationConfig, importProvidersFrom, isDevMode, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {jwtInterceptor} from './core/interceptors/jwt.interceptor';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {registerLocaleData} from '@angular/common';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';
import {FriendshipService} from './core/services/domain/user/friendship.service';

import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr, 'fr-FR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      })
    ),
    {provide: LOCALE_ID, useValue: 'fr-FR'},
    provideCharts(withDefaultRegisterables()),

  ],
};
