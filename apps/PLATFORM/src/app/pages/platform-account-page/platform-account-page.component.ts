import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '@streaming-platform/api-services';
import { AuthStore } from '@streaming-platform/auth-lib';
import { SpinnerComponent, ToastStore } from '@streaming-platform/ui-components';
import { SiEnvelopeIcon, SiKeyIcon, SiShieldCheckIcon } from '@semantic-icons/heroicons/24/outline';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SpinnerComponent,
    SiEnvelopeIcon,
    SiKeyIcon,
    SiShieldCheckIcon,
  ],
  templateUrl: './platform-account-page.component.html',
})
export class PlatformAccountPageComponent {
  private readonly authApi = inject(AuthApiService);
  protected readonly auth = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly toasts = inject(ToastStore);

  protected readonly savingPassword = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly purchasedMovieCount = computed(() => this.auth.tickets().length);

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    nextPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

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
