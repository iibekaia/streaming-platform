import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '@streaming-platform/api-services';
import { AuthStore } from '@streaming-platform/auth-lib';
import { UserRole } from '@streaming-platform/data-models';
import { SpinnerComponent, ToastStore } from '@streaming-platform/ui-components';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './dashboard-login-page.component.html',
})
export class DashboardLoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthApiService);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastStore);

  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    const { identifier, password } = this.form.getRawValue();
    this.loading.set(true);
    this.api.login(identifier, password, UserRole.ADMIN).subscribe({
      next: (response) => {
        this.auth.hydrateFromToken(response.accessToken);
        this.loading.set(false);
        this.toasts.show('Admin session started.', 'success');
        void this.router.navigateByUrl('/dashboard');
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.error.set(error.message);
      },
    });
  }
}
