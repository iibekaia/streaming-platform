import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthTokenResponse, JwtSessionClaims, Plan, Ticket, User } from '@streaming-platform/data-models';
import { AuthApiService } from '@streaming-platform/api-services';
import { decodeJwtPayload } from '@streaming-platform/utils';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApiService);
  private readonly favoritesStorageKey = 'sp.favoriteMovieIds';

  readonly user = signal<Omit<User, 'password'> | null>(null);
  readonly tickets = signal<Ticket[]>([]);
  readonly activePlan = signal<Plan | null>(null);
  readonly accessToken = signal<string | null>(null);
  readonly claims = signal<JwtSessionClaims | null>(null);
  readonly favoriteMovieIds = signal<string[]>(this.readFavorites());
  readonly sessionMessage = signal<string | null>(null);
  readonly loading = signal(false);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly isAdmin = computed(() => this.user()?.role === 'admin');
  readonly hasUnlimited = computed(() => this.user()?.plan === 'unlimited');
  readonly favoriteCount = computed(() => this.favoriteMovieIds().length);

  hydrateFromToken(token: string): void {
    this.setAccessToken(token);
    const claims = this.claims();
    if (!claims) {
      this.clear();
      return;
    }
    this.user.set(claims.user);
    this.tickets.set(
      claims.ticketMovieIds.map((movieId, index) => ({
        id: `ticket-${movieId}-${index}`,
        userId: claims.user.id,
        movieId,
        purchasedAt: '',
      })),
    );
    this.activePlan.set(claims.activePlan ?? null);
    this.sessionMessage.set(null);
  }

  clear(message?: string): void {
    this.user.set(null);
    this.tickets.set([]);
    this.activePlan.set(null);
    this.accessToken.set(null);
    this.claims.set(null);
    this.sessionMessage.set(message ?? null);
  }

  setAccessToken(token: string | null): void {
    this.accessToken.set(token);
    this.claims.set(token ? decodeJwtPayload<JwtSessionClaims>(token) : null);
  }

  validateSession() {
    this.loading.set(true);
    return this.api.validateSession().pipe(
      tap({
        next: (response: AuthTokenResponse) => {
          this.hydrateFromToken(response.accessToken);
          this.loading.set(false);
        },
        error: () => {
          this.clear("You've been signed out because your account was accessed from another device.");
          this.loading.set(false);
        },
      }),
    );
  }

  logout(message?: string) {
    this.loading.set(true);
    return this.api.logout().pipe(
      tap(() => {
        this.clear(message);
        this.loading.set(false);
      }),
    );
  }

  hasMovieAccess(movieId: string): boolean {
    return (
      this.hasUnlimited() ||
      this.tickets().some((ticket) => ticket.movieId === movieId) ||
      false
    );
  }

  isFavorite(movieId: string): boolean {
    return this.favoriteMovieIds().includes(movieId);
  }

  toggleFavorite(movieId: string): void {
    const nextFavorites = this.isFavorite(movieId)
      ? this.favoriteMovieIds().filter((id) => id !== movieId)
      : [...this.favoriteMovieIds(), movieId];

    this.favoriteMovieIds.set(nextFavorites);
    this.writeFavorites(nextFavorites);
  }

  private readFavorites(): string[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.favoritesStorageKey);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  }

  private writeFavorites(movieIds: string[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.favoritesStorageKey, JSON.stringify(movieIds));
  }
}
