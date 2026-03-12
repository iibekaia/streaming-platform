import { Route } from '@angular/router';
import { adminGuard, guestGuard } from '@streaming-platform/auth-lib';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [guestGuard],
    data: {
      seo: {
        title: 'Dashboard Login',
        description: 'Secure admin sign in for the streaming dashboard.',
        robots: 'noindex, nofollow',
      },
    },
    loadComponent: () => import('./pages/dashboard-login-page/dashboard-login-page.component').then((m) => m.DashboardLoginPageComponent),
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/dashboard-shell/dashboard-shell.component').then((m) => m.DashboardShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', data: { seo: { title: 'Dashboard Overview', description: 'Protected admin overview.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./pages/dashboard-home-page/dashboard-home-page.component').then((m) => m.DashboardHomePageComponent) },
      { path: 'movies', data: { seo: { title: 'Dashboard Movies', description: 'Protected movie management.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./pages/dashboard-movies-page/dashboard-movies-page.component').then((m) => m.DashboardMoviesPageComponent) },
      { path: 'categories', data: { seo: { title: 'Dashboard Categories', description: 'Protected category management.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./pages/dashboard-categories-page/dashboard-categories-page.component').then((m) => m.DashboardCategoriesPageComponent) },
      { path: 'users', data: { seo: { title: 'Dashboard Users', description: 'Protected user management.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./pages/dashboard-users-page/dashboard-users-page.component').then((m) => m.DashboardUsersPageComponent) },
      { path: 'plans', data: { seo: { title: 'Dashboard Plans', description: 'Protected plan management.', robots: 'noindex, nofollow' } }, loadComponent: () => import('./pages/dashboard-plans-page/dashboard-plans-page.component').then((m) => m.DashboardPlansPageComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
