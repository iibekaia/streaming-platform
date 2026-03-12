import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '@streaming-platform/api-services';
import { AuthStore } from '@streaming-platform/auth-lib';
import { SpinnerComponent, ToastStore } from '@streaming-platform/ui-components';
import { formatPrice } from '@streaming-platform/utils';

@Component({
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './platform-plans-page.component.html',
})
export class PlatformPlansPageComponent {
  private readonly auth = inject(AuthStore);
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastStore);

  protected readonly loading = signal(false);
  protected readonly formatPrice = formatPrice;

  upgrade(): void {
    const user = this.auth.user();
    if (!user) {
      return;
    }
    this.loading.set(true);
    this.api.buyUnlimited(user.id).subscribe((result) => {
      this.auth.user.update((current) => (current ? { ...current, plan: 'unlimited' } : current));
      this.auth.activePlan.set(result.activePlan ?? null);
      this.loading.set(false);
      this.toasts.show('UNLIMITED plan activated.', 'success');
      void this.router.navigateByUrl('/movies');
    });
  }
}
