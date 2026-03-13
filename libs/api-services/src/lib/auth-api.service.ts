import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthTokenResponse, PurchaseResult, UserRole } from '@streaming-platform/data-models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  login(identifier: string, password: string, role?: UserRole): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.baseUrl}/auth/login`, { identifier, password, role }, { withCredentials: true });
  }

  register(username: string, displayName: string, email: string, password: string): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.baseUrl}/auth/register`, { username, displayName, email, password }, { withCredentials: true });
  }

  validateSession(): Observable<AuthTokenResponse> {
    return this.http.get<AuthTokenResponse>(`${this.baseUrl}/auth/validate-session`, { withCredentials: true });
  }

  refresh(): Observable<string> {
    return this.http
      .post<{ accessToken: string }>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(map((response) => response.accessToken));
  }

  logout(): Observable<void> {
    return this.http.post<{ ok: true }>(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true }).pipe(map(() => void 0));
  }

  changePassword(currentPassword: string, nextPassword: string): Observable<void> {
    return this.http
      .post<{ ok: true }>(
        `${this.baseUrl}/auth/change-password`,
        { currentPassword, nextPassword },
        { withCredentials: true },
      )
      .pipe(map(() => void 0));
  }

  buyTicket(_: string, movieId: string): Observable<PurchaseResult> {
    return this.http.post<PurchaseResult>(`${this.baseUrl}/purchases/tickets/${movieId}`, {}, { withCredentials: true });
  }

  buyUnlimited(_: string): Observable<PurchaseResult> {
    return this.http.post<PurchaseResult>(`${this.baseUrl}/purchases/unlimited`, {}, { withCredentials: true });
  }
}
