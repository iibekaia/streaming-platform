import { Route } from '@angular/router';
import { authGuard, guestGuard } from '@streaming-platform/auth-lib';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/platform-login-page/platform-login-page.component').then((m) => m.PlatformLoginPageComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/platform-register-page/platform-register-page.component').then((m) => m.PlatformRegisterPageComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/platform-shell/platform-shell.component').then((m) => m.PlatformShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'movies' },
      { path: 'movies', loadComponent: () => import('./pages/platform-movies-page/platform-movies-page.component').then((m) => m.PlatformMoviesPageComponent) },
      { path: 'movies/:id', loadComponent: () => import('./pages/platform-movie-detail-page/platform-movie-detail-page.component').then((m) => m.PlatformMovieDetailPageComponent) },
      { path: 'plans', loadComponent: () => import('./pages/platform-plans-page/platform-plans-page.component').then((m) => m.PlatformPlansPageComponent) },
    ],
  },
  { path: '**', redirectTo: 'movies' },
];
