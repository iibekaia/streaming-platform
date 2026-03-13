import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryApiService, MovieApiService } from '@streaming-platform/api-services';
import { Category, Movie } from '@streaming-platform/data-models';
import { formatPrice } from '@streaming-platform/utils';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-movies-page.component.html',
})
export class DashboardMoviesPageComponent {
  private readonly moviesApi = inject(MovieApiService);
  private readonly categoriesApi = inject(CategoryApiService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly movies = signal<Movie[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly selectedMovie = signal<Movie | null>(null);
  protected readonly selectedCategoryIds = signal<string[]>([]);
  protected readonly isModalOpen = signal(false);
  protected readonly isImporting = signal(false);
  protected readonly importError = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 8;
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly formatPrice = formatPrice;
  protected readonly pageLabel = computed(() => `Page ${this.page()} of ${this.totalPages()}`);
  protected readonly visiblePages = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.page();
    const end = Math.min(totalPages, Math.max(5, currentPage + 2));
    const start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  protected readonly form = this.fb.nonNullable.group({
    imdbId: [''],
    title: [''],
    description: [''],
    posterUrl: [''],
    videoUrl: [''],
    year: [2026],
    duration: [100],
    director: [''],
    cast: [''],
    rating: [7],
    ticketPrice: [8],
    status: ['draft'],
  });

  constructor() {
    this.page.set(this.readPageFromUrl());
    this.refresh();
    this.categoriesApi.listAll().subscribe((categories) => this.categories.set(categories));
  }

  openModal(movie?: Movie): void {
    this.isModalOpen.set(true);
    this.selectedMovie.set(movie ?? null);
    this.selectedCategoryIds.set(movie?.categories ?? []);
    this.importError.set('');
    this.form.patchValue({
      imdbId: movie?.imdbId ?? '',
      title: movie?.title ?? '',
      description: movie?.description ?? '',
      posterUrl: movie?.posterUrl ?? '',
      videoUrl: movie?.videoUrl ?? '',
      year: movie?.year ?? 2026,
      duration: movie?.duration ?? 100,
      director: movie?.director ?? '',
      cast: movie?.cast.join(', ') ?? '',
      rating: movie?.rating ?? 7,
      ticketPrice: movie?.ticketPrice ?? 8,
      status: movie?.status ?? 'draft',
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedMovie.set(null);
    this.selectedCategoryIds.set([]);
    this.importError.set('');
    this.form.reset({
      imdbId: '',
      title: '',
      description: '',
      posterUrl: '',
      videoUrl: '',
      year: 2026,
      duration: 100,
      director: '',
      cast: '',
      rating: 7,
      ticketPrice: 8,
      status: 'draft',
    });
  }

  toggleCategory(id: string): void {
    const current = this.selectedCategoryIds();
    this.selectedCategoryIds.set(current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  importImdbMovie(): void {
    const imdbId = this.form.controls.imdbId.getRawValue().trim();
    if (!imdbId) {
      this.importError.set('Enter an IMDb id first, for example tt0111161.');
      return;
    }

    this.importError.set('');
    this.isImporting.set(true);
    this.moviesApi
      .importFromImdb(imdbId)
      .pipe(finalize(() => this.isImporting.set(false)))
      .subscribe({
        next: (movie) => {
          this.selectedCategoryIds.set(movie.categories ?? []);
          this.form.patchValue({
            imdbId: movie.imdbId ?? imdbId,
            title: movie.title,
            description: movie.description ?? '',
            posterUrl: movie.posterUrl ?? '',
            videoUrl: movie.videoUrl ?? '',
            year: movie.year ?? 2026,
            duration: movie.duration ?? 100,
            director: movie.director ?? '',
            cast: movie.cast?.join(', ') ?? '',
            rating: movie.rating ?? 7,
            ticketPrice: movie.ticketPrice ?? 8,
            status: movie.status ?? 'draft',
          });
        },
        error: (error) => {
          this.importError.set(error?.error?.message ?? 'Could not import that IMDb title.');
        },
      });
  }

  save(): void {
    const value = this.form.getRawValue();
    this.moviesApi.save({
      id: this.selectedMovie()?.id,
      ...value,
      imdbId: value.imdbId.trim() || undefined,
      cast: value.cast.split(',').map((item) => item.trim()).filter(Boolean),
      categories: this.selectedCategoryIds(),
      year: Number(value.year),
      duration: Number(value.duration),
      rating: Number(value.rating),
      ticketPrice: Number(value.ticketPrice),
      status: value.status as Movie['status'],
    }).subscribe(() => {
      this.closeModal();
      this.refresh();
    });
  }

  remove(movieId: string): void {
    this.moviesApi.delete(movieId).subscribe(() => this.refresh());
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) {
      return;
    }

    this.setPageState(nextPage);
    this.refresh();
  }

  categoryNames(movie: Movie): string[] {
    return movie.categories
      .map((id) => this.categories().find((category) => category.id === id)?.name)
      .filter((value): value is string => !!value);
  }

  private refresh(): void {
    this.moviesApi
      .list({ includeDrafts: true, page: this.page(), pageSize: this.pageSize })
      .subscribe((response) => {
        this.movies.set(response.items);
        this.total.set(response.total);
        this.totalPages.set(response.totalPages);
      });
  }

  private readPageFromUrl(): number {
    const rawPage = Number(this.route.snapshot.queryParamMap.get('page') ?? '1');
    return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  }

  private setPageState(page: number): void {
    this.page.set(page);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
