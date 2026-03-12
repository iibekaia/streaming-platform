import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '@streaming-platform/api-services';
import { AuthStore } from '@streaming-platform/auth-lib';
import { SpinnerComponent } from '@streaming-platform/ui-components';
import { ToastStore } from '@streaming-platform/ui-components';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
  templateUrl: './platform-login-page.component.html',
})
export class PlatformLoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApiService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastStore);

  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    email: ['ava@example.com', [Validators.required, Validators.email]],
    password: ['Password123!', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.api.login(email, password, 'user').subscribe({
      next: (response) => {
        this.auth.hydrateFromToken(response.accessToken);
        this.loading.set(false);
        this.toasts.show(`Welcome back, ${this.auth.user()?.displayName}.`, 'success');
        void this.router.navigateByUrl('/movies');
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.error.set(error.message);
      },
    });
  }
}
