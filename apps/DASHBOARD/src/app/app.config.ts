import { APP_INITIALIZER, ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@streaming-platform/auth-lib';
import { AuthStore } from '@streaming-platform/auth-lib';
import { provideApiBaseUrl } from '@streaming-platform/api-services';
import { I18nService } from '@streaming-platform/ui-components';
import { provideRouter } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

function initializeAuth() {
  const auth = inject(AuthStore);
  return () => firstValueFrom(auth.validateSession().pipe(catchError(() => of(null))));
}

function initializeI18n() {
  const i18n = inject(I18nService);
  return () => i18n.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideApiBaseUrl(environment.apiBaseUrl),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initializeAuth,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initializeI18n,
    },
  ],
};
