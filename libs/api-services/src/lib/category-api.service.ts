import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Category, PaginatedResponse, PaginationQuery } from '@streaming-platform/data-models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  list(query: PaginationQuery = {}): Observable<PaginatedResponse<Category & { movieCount: number }>> {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<PaginatedResponse<Category & { movieCount: number }>>(`${this.baseUrl}/categories${suffix}`, { withCredentials: true });
  }

  listAll(): Observable<Array<Category & { movieCount: number }>> {
    return this.list({ page: 1, pageSize: 100 }).pipe(map((response) => response.items));
  }

  save(category: Partial<Category> & Pick<Category, 'name'>): Observable<Category> {
    return category.id
      ? this.http.put<Category>(`${this.baseUrl}/admin/categories/${category.id}`, category, { withCredentials: true })
      : this.http.post<Category>(`${this.baseUrl}/admin/categories`, category, { withCredentials: true });
  }

  delete(categoryId: string): Observable<{ softDeleted: boolean }> {
    return this.http.delete<{ softDeleted: boolean }>(`${this.baseUrl}/admin/categories/${categoryId}`, { withCredentials: true });
  }
}
