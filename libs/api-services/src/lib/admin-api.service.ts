import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AnalyticsSummary, PlanConfig, User } from '@streaming-platform/data-models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/admin';

  analytics(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.baseUrl}/analytics`, { withCredentials: true });
  }

  listUsers(): Observable<Array<Omit<User, 'password'>>> {
    return this.http.get<Array<Omit<User, 'password'>>>(`${this.baseUrl}/users`, { withCredentials: true });
  }

  revokeSession(userId: string): Observable<void> {
    return this.http.post<{ ok: true }>(`${this.baseUrl}/users/${userId}/revoke-session`, {}, { withCredentials: true }).pipe(map(() => void 0));
  }

  toggleUserStatus(userId: string): Observable<void> {
    return this.http.post<{ ok: true }>(`${this.baseUrl}/users/${userId}/toggle-status`, {}, { withCredentials: true }).pipe(map(() => void 0));
  }

  getPlanConfig(): Observable<PlanConfig> {
    return this.http.get<PlanConfig>(`${this.baseUrl}/plans`, { withCredentials: true });
  }

  savePlanConfig(config: PlanConfig): Observable<PlanConfig> {
    return this.http.put<PlanConfig>(`${this.baseUrl}/plans`, config, { withCredentials: true });
  }
}
