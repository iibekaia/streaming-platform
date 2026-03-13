import { CommonModule } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthApiService, CategoryApiService, MovieApiService } from '@streaming-platform/api-services';
import { AuthStore } from '@streaming-platform/auth-lib';
import { Category, Movie } from '@streaming-platform/data-models';
import { SpinnerComponent, ToastStore } from '@streaming-platform/ui-components';
import { formatPrice, formatRuntime } from '@streaming-platform/utils';
import { SiArrowsPointingOutIcon, SiHeartIcon, SiXMarkIcon } from '@semantic-icons/heroicons/24/outline';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, SiHeartIcon, SiArrowsPointingOutIcon, SiXMarkIcon],
  templateUrl: './platform-movie-detail-page.component.html',
})
export class PlatformMovieDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly moviesApi = inject(MovieApiService);
  private readonly categoriesApi = inject(CategoryApiService);
  private readonly authApi = inject(AuthApiService);
  protected readonly auth = inject(AuthStore);
  private readonly toasts = inject(ToastStore);
  private readonly playerFrame = viewChild<ElementRef<HTMLDivElement>>('playerFrame');

  protected readonly movie = signal<Movie | undefined>(undefined);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly playing = signal(false);
  protected readonly formatRuntime = formatRuntime;
  protected readonly formatPrice = formatPrice;
  protected readonly canWatch = computed(() => !!this.movie() && this.auth.hasMovieAccess(this.movie()!.id));

  constructor() {
    this.categoriesApi.listAll().subscribe((categories) => this.categories.set(categories));
    this.moviesApi.getById(this.route.snapshot.params['id']).subscribe((movie) => {
      this.movie.set(movie);
      this.loading.set(false);
    });
  }

  categoryNames(): string[] {
    return (this.movie()?.categories ?? [])
      .map((id) => this.categories().find((category) => category.id === id)?.name)
      .filter((value): value is string => !!value);
  }

  buyTicket(): void {
    const user = this.auth.user();
    const movie = this.movie();
    if (!user || !movie) {
      return;
    }
    this.authApi.buyTicket(user.id, movie.id).subscribe((result) => {
      this.auth.tickets.set(result.tickets);
      this.auth.activePlan.set(result.activePlan ?? null);
      this.toasts.show('Ticket purchased. You can start watching now.', 'success');
    });
  }

  buyUnlimited(): void {
    const user = this.auth.user();
    if (!user) {
      return;
    }
    this.authApi.buyUnlimited(user.id).subscribe((result) => {
      this.auth.user.update((current) => (current ? { ...current, plan: 'unlimited' } : current));
      this.auth.tickets.set(result.tickets);
      this.auth.activePlan.set(result.activePlan ?? null);
      this.toasts.show('UNLIMITED activated.', 'success');
    });
  }

  toggleFavorite(movieId: string): void {
    this.auth.toggleFavorite(movieId);
  }

  openPlayer(): void {
    this.playing.set(true);
  }

  closePlayer(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    }
    this.playing.set(false);
  }

  toggleFullscreen(): void {
    const frame = this.playerFrame()?.nativeElement;
    if (!frame) {
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    void frame.requestFullscreen();
  }
}
