import { DOCUMENT } from '@angular/common';
import { Injectable, Injector, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class SessionSyncService {
  private readonly document = inject(DOCUMENT);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  init(): void {
    const path = this.document.location.pathname;
    const isAuthPath = path.endsWith('/login') || path.endsWith('/register');

    if (!isAuthPath) {
      this.auth
        .validateSession()
        .pipe(
          catchError(() => {
            void this.router.navigateByUrl('/login');
            return of(null);
          }),
        )
        .subscribe();
    }

    const handleVisibility = () => {
      if (this.document.visibilityState === 'visible' && this.auth.isAuthenticated()) {
        this.auth.validateSession().subscribe({
          error: () => this.router.navigateByUrl('/login'),
        });
      }
    };

    this.document.addEventListener('visibilitychange', handleVisibility);

    effect(
      () => {
        if (!this.auth.isAuthenticated() && this.router.url !== '/login' && this.router.url !== '/register') {
          void this.router.navigateByUrl('/login');
        }
      },
      { injector: this.injector },
    );
  }
}
