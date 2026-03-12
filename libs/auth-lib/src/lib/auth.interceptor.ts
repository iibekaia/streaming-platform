import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthApiService } from '@streaming-platform/api-services';
import { AuthStore } from './auth.store';
import { catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';

let refreshInFlight: ReturnType<AuthApiService['refresh']> | null = null;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authApi = inject(AuthApiService);
  const authStore = inject(AuthStore);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || request.url.includes('/auth/login') || request.url.includes('/auth/register') || request.url.includes('/auth/refresh')) {
        return throwError(() => error);
      }

      refreshInFlight ??= authApi.refresh().pipe(
        finalize(() => {
          refreshInFlight = null;
        }),
        shareReplay(1),
      );

      return refreshInFlight.pipe(
        switchMap((accessToken) => {
          authStore.setAccessToken(accessToken);
          return next(request);
        }),
        catchError((refreshError) => {
          authStore.clear("You've been signed out because your account was accessed from another device.");
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
