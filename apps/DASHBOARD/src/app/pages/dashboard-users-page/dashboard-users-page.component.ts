import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AdminApiService } from '@streaming-platform/api-services';
import { SubscriptionPlan, User } from '@streaming-platform/data-models';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-users-page.component.html',
})
export class DashboardUsersPageComponent {
  private readonly adminApi = inject(AdminApiService);
  protected readonly planLabels: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.STANDARD]: 'STANDARD',
    [SubscriptionPlan.UNLIMITED]: 'UNLIMITED',
  };
  protected readonly users = signal<Array<Omit<User, 'password'>>>([]);
  protected readonly page = signal(1);
  protected readonly pageSize = 8;
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly pageLabel = computed(() => `Page ${this.page()} of ${this.totalPages()}`);

  constructor() {
    this.refresh();
  }

  revoke(userId: string): void {
    this.adminApi.revokeSession(userId).subscribe(() => this.refresh());
  }

  toggle(userId: string): void {
    this.adminApi.toggleUserStatus(userId).subscribe(() => this.refresh());
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) {
      return;
    }

    this.page.set(nextPage);
    this.refresh();
  }

  private refresh(): void {
    this.adminApi.listUsers({ page: this.page(), pageSize: this.pageSize }).subscribe((response) => {
      this.users.set(response.items);
      this.total.set(response.total);
      this.totalPages.set(response.totalPages);
    });
  }
}
