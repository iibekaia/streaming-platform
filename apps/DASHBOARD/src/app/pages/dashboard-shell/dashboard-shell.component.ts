import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '@streaming-platform/auth-lib';
import { SiChartBarSquareIcon, SiFilmIcon, SiTagIcon, SiUsersIcon } from '@semantic-icons/heroicons/24/outline';
import { SiArrowLeftOnRectangleIcon, SiCreditCardIcon } from '@semantic-icons/heroicons/24/solid';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, SiChartBarSquareIcon, SiFilmIcon, SiTagIcon, SiUsersIcon, SiCreditCardIcon, SiArrowLeftOnRectangleIcon],
  templateUrl: './dashboard-shell.component.html',
})
export class DashboardShellComponent {
  protected readonly auth = inject(AuthStore);

  logout(): void {
    this.auth.logout().subscribe();
  }
}
