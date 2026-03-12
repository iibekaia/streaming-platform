import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '@streaming-platform/api-services';
import { AuthStore } from '@streaming-platform/auth-lib';
import { SpinnerComponent, ToastStore } from '@streaming-platform/ui-components';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
  templateUrl: './platform-register-page.component.html',
})
export class PlatformRegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApiService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastStore);

  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  submit(): void {
    const { displayName, email, password, confirmPassword } = this.form.getRawValue();
    if (this.form.invalid) {
      return;
    }
    if (password !== confirmPassword) {
      this.error.set('Passwords must match.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.api.register(displayName, email, password).subscribe({
      next: (response) => {
        this.auth.hydrateFromToken(response.accessToken);
        this.loading.set(false);
        this.toasts.show('Account created successfully.', 'success');
        void this.router.navigateByUrl('/movies');
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.error.set(error.message);
      },
    });
  }
}
