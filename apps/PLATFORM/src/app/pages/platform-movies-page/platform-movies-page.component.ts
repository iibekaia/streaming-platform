import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryApiService, MovieApiService } from '@streaming-platform/api-services';
import { AuthStore } from '@streaming-platform/auth-lib';
import { Category, Movie } from '@streaming-platform/data-models';
import { SearchBarComponent, SpinnerComponent } from '@streaming-platform/ui-components';
import { formatPrice, formatRuntime } from '@streaming-platform/utils';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiHeartIcon } from '@semantic-icons/heroicons/24/outline';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBarComponent, SpinnerComponent, SiHeartIcon],
  templateUrl: './platform-movies-page.component.html',
})
export class PlatformMoviesPageComponent {
  private readonly moviesApi = inject(MovieApiService);
  private readonly categoriesApi = inject(CategoryApiService);
  protected readonly auth = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();

  protected readonly movies = signal<Movie[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly selectedCategories = signal<string[]>([]);
  protected readonly search = signal('');
  protected readonly loading = signal(true);
  protected readonly formatRuntime = formatRuntime;
  protected readonly formatPrice = formatPrice;

  constructor() {
    this.categoriesApi.list().subscribe((categories) => this.categories.set(categories));
    this.searchChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) =>
          this.moviesApi.list({
            search: value,
            categoryIds: this.selectedCategories(),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      });

    this.refresh();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.loading.set(true);
    this.searchChanges.next(value);
  }

  toggleCategory(categoryId: string): void {
    const current = this.selectedCategories();
    this.selectedCategories.set(
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId],
    );
    this.refresh();
  }

  categoryNames(movie: Movie): string[] {
    return movie.categories
      .map((id) => this.categories().find((category) => category.id === id)?.name)
      .filter((value): value is string => !!value);
  }

  toggleFavorite(event: MouseEvent, movieId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.toggleFavorite(movieId);
  }

  private refresh(): void {
    this.loading.set(true);
    this.moviesApi
      .list({ search: this.search(), categoryIds: this.selectedCategories() })
      .subscribe((movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      });
  }
}
