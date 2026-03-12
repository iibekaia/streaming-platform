import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService, MovieApiService } from '@streaming-platform/api-services';
import { AuthStore } from '@streaming-platform/auth-lib';
import { Movie } from '@streaming-platform/data-models';
import { SpinnerComponent, ToastStore } from '@streaming-platform/ui-components';
import { formatPrice, formatRuntime } from '@streaming-platform/utils';
import { SiEnvelopeIcon, SiHeartIcon, SiKeyIcon, SiShieldCheckIcon } from '@semantic-icons/heroicons/24/outline';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SpinnerComponent,
    SiEnvelopeIcon,
    SiHeartIcon,
    SiKeyIcon,
    SiShieldCheckIcon,
  ],
  templateUrl: './platform-account-page.component.html',
})
export class PlatformAccountPageComponent {
  private readonly authApi = inject(AuthApiService);
  protected readonly auth = inject(AuthStore);
  private readonly moviesApi = inject(MovieApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toasts = inject(ToastStore);

  protected readonly loadingFavorites = signal(true);
  protected readonly savingPassword = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly allMovies = signal<Movie[]>([]);
  protected readonly formatRuntime = formatRuntime;
  protected readonly formatPrice = formatPrice;

  protected readonly favoriteMovies = computed(() =>
    this.allMovies().filter((movie) => this.auth.favoriteMovieIds().includes(movie.id)),
  );
  protected readonly purchasedMovieCount = computed(() => this.auth.tickets().length);

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    nextPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.moviesApi.list().subscribe((movies) => {
      this.allMovies.set(movies);
      this.loadingFavorites.set(false);
    });
  }

  removeFavorite(movieId: string): void {
    this.auth.toggleFavorite(movieId);
    this.toasts.show('Removed from favorites.', 'info');
  }

  submitPasswordReset(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    const { currentPassword, nextPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (nextPassword !== confirmPassword) {
      this.passwordError.set('New password and confirmation do not match.');
      return;
    }

    this.passwordError.set(null);
    this.savingPassword.set(true);
    this.authApi.changePassword(currentPassword, nextPassword).subscribe({
      next: () => {
        this.passwordForm.reset({
          currentPassword: '',
          nextPassword: '',
          confirmPassword: '',
        });
        this.savingPassword.set(false);
        this.toasts.show('Password updated successfully.', 'success');
      },
      error: (error) => {
        this.savingPassword.set(false);
        this.passwordError.set(error?.error?.message ?? 'Could not update password.');
      },
    });
  }
}
