import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '@streaming-platform/auth-lib';
import { ToastStore } from '@streaming-platform/ui-components';
import { SiFilmIcon, SiHeartIcon, SiPlayCircleIcon } from '@semantic-icons/heroicons/24/outline';
import { SiArrowLeftOnRectangleIcon } from '@semantic-icons/heroicons/24/solid';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SiFilmIcon, SiHeartIcon, SiPlayCircleIcon, SiArrowLeftOnRectangleIcon],
  templateUrl: './platform-shell.component.html',
})
export class PlatformShellComponent {
  protected readonly auth = inject(AuthStore);
  private readonly toasts = inject(ToastStore);

  protected readonly planLabel = computed(() =>
    this.auth.hasUnlimited() ? 'UNLIMITED active' : 'Free plan',
  );
  protected readonly favoriteCount = computed(() => this.auth.favoriteCount());

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.toasts.show('Signed out.', 'info');
    });
  }
}
