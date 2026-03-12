import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthApiService } from '@streaming-platform/api-services';
import { AuthStore } from './auth.store';
import { catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';

let refreshInFlight: ReturnType<AuthApiService['refresh']> | null = null;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authApi = inject(AuthApiService);
  const authStore = inject(AuthStore);
  const csrfToken = readCookie('sp_csrf');
  const preparedRequest =
    csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
      ? request.clone({ setHeaders: { 'X-CSRF-Token': csrfToken } })
      : request;

  return next(preparedRequest).pipe(
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
          const retriedCsrfToken = readCookie('sp_csrf');
          const retriedRequest =
            retriedCsrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
              ? request.clone({ setHeaders: { 'X-CSRF-Token': retriedCsrfToken } })
              : request;
          return next(retriedRequest);
        }),
        catchError((refreshError) => {
          authStore.clear("You've been signed out because your account was accessed from another device.");
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
