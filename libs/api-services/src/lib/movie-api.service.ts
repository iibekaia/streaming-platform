import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Movie, MovieQuery } from '@streaming-platform/data-models';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MovieApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  list(query: MovieQuery = {}): Observable<Movie[]> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.categoryIds?.length) params = params.set('categoryIds', query.categoryIds.join(','));
    if (query.includeDrafts) params = params.set('includeDrafts', 'true');
    return this.http.get<Movie[]>(`${this.baseUrl}/movies`, { params, withCredentials: true });
  }

  getById(id: string): Observable<Movie | undefined> {
    return this.http.get<Movie | undefined>(`${this.baseUrl}/movies/${id}`, { withCredentials: true });
  }

  save(movie: Partial<Movie> & Pick<Movie, 'title'>): Observable<Movie> {
    return movie.id
      ? this.http.put<Movie>(`${this.baseUrl}/admin/movies/${movie.id}`, movie, { withCredentials: true })
      : this.http.post<Movie>(`${this.baseUrl}/admin/movies`, movie, { withCredentials: true });
  }

  importFromImdb(imdbId: string): Observable<Partial<Movie> & Pick<Movie, 'title'>> {
    return this.http.get<Partial<Movie> & Pick<Movie, 'title'>>(`${this.baseUrl}/admin/movies/import/imdb/${imdbId}`, {
      withCredentials: true,
    });
  }

  delete(movieId: string): Observable<void> {
    return this.http.delete<{ ok: true }>(`${this.baseUrl}/admin/movies/${movieId}`, { withCredentials: true }).pipe(map(() => void 0));
  }
}
