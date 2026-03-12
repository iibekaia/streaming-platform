import { Route } from '@angular/router';
import { adminGuard, guestGuard } from '@streaming-platform/auth-lib';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/dashboard-login-page/dashboard-login-page.component').then((m) => m.DashboardLoginPageComponent),
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/dashboard-shell/dashboard-shell.component').then((m) => m.DashboardShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard-home-page/dashboard-home-page.component').then((m) => m.DashboardHomePageComponent) },
      { path: 'movies', loadComponent: () => import('./pages/dashboard-movies-page/dashboard-movies-page.component').then((m) => m.DashboardMoviesPageComponent) },
      { path: 'categories', loadComponent: () => import('./pages/dashboard-categories-page/dashboard-categories-page.component').then((m) => m.DashboardCategoriesPageComponent) },
      { path: 'users', loadComponent: () => import('./pages/dashboard-users-page/dashboard-users-page.component').then((m) => m.DashboardUsersPageComponent) },
      { path: 'plans', loadComponent: () => import('./pages/dashboard-plans-page/dashboard-plans-page.component').then((m) => m.DashboardPlansPageComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
