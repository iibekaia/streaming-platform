import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
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
  protected readonly page = signal(1);
  protected readonly pageSize = 12;
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly formatRuntime = formatRuntime;
  protected readonly formatPrice = formatPrice;
  protected readonly pageLabel = computed(() => `Page ${this.page()} of ${this.totalPages()}`);

  constructor() {
    this.categoriesApi.listAll().subscribe((categories) => this.categories.set(categories));
    this.searchChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) =>
          this.moviesApi.list({
            search: value,
            categoryIds: this.selectedCategories(),
            page: this.page(),
            pageSize: this.pageSize,
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.movies.set(response.items);
        this.total.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      });

    this.refresh();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
    this.loading.set(true);
    this.searchChanges.next(value);
  }

  toggleCategory(categoryId: string): void {
    const current = this.selectedCategories();
    this.selectedCategories.set(
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId],
    );
    this.page.set(1);
    this.refresh();
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) {
      return;
    }

    this.page.set(nextPage);
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
      .list({ search: this.search(), categoryIds: this.selectedCategories(), page: this.page(), pageSize: this.pageSize })
      .subscribe((response) => {
        this.movies.set(response.items);
        this.total.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      });
  }
}
