import { Route } from '@angular/router';
import { authGuard, guestGuard } from '@streaming-platform/auth-lib';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [guestGuard],
    data: {
      seo: {
        title: 'Streaming Platform Login',
        description: 'Sign in to access your streaming library, subscriptions, and purchased movies.',
        robots: 'index, follow',
      },
    },
    loadComponent: () => import('./pages/platform-login-page/platform-login-page.component').then((m) => m.PlatformLoginPageComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    data: {
      seo: {
        title: 'Create Streaming Platform Account',
        description: 'Create your account to buy movie tickets and manage your streaming access.',
        robots: 'noindex, nofollow',
      },
    },
    loadComponent: () => import('./pages/platform-register-page/platform-register-page.component').then((m) => m.PlatformRegisterPageComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/platform-shell/platform-shell.component').then((m) => m.PlatformShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'movies' },
      {
        path: 'movies',
        data: { seo: { title: 'Movies', description: 'Protected movie catalog.', robots: 'noindex, nofollow' } },
        loadComponent: () => import('./pages/platform-movies-page/platform-movies-page.component').then((m) => m.PlatformMoviesPageComponent),
      },
      {
        path: 'movies/:id',
        data: { seo: { title: 'Movie Details', description: 'Protected movie details.', robots: 'noindex, nofollow' } },
        loadComponent: () => import('./pages/platform-movie-detail-page/platform-movie-detail-page.component').then((m) => m.PlatformMovieDetailPageComponent),
      },
      {
        path: 'plans',
        data: { seo: { title: 'Plans', description: 'Protected subscription plans.', robots: 'noindex, nofollow' } },
        loadComponent: () => import('./pages/platform-plans-page/platform-plans-page.component').then((m) => m.PlatformPlansPageComponent),
      },
      {
        path: 'account',
        data: { seo: { title: 'Account', description: 'Protected account area.', robots: 'noindex, nofollow' } },
        loadComponent: () => import('./pages/platform-account-page/platform-account-page.component').then((m) => m.PlatformAccountPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'movies' },
];
