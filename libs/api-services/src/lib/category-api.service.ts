import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Category } from '@streaming-platform/data-models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  list(): Observable<Array<Category & { movieCount: number }>> {
    return this.http.get<Array<Category & { movieCount: number }>>(`${this.baseUrl}/categories`, { withCredentials: true });
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
