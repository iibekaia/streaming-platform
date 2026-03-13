import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService } from '@streaming-platform/api-services';
import { SubscriptionPlan, User } from '@streaming-platform/data-models';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-users-page.component.html',
})
export class DashboardUsersPageComponent {
  private readonly adminApi = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
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
  protected readonly visiblePages = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.page();
    const end = Math.min(totalPages, Math.max(5, currentPage + 2));
    const start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  constructor() {
    this.page.set(this.readPageFromUrl());
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

    this.setPageState(nextPage);
    this.refresh();
  }

  private refresh(): void {
    this.adminApi.listUsers({ page: this.page(), pageSize: this.pageSize }).subscribe((response) => {
      this.users.set(response.items);
      this.total.set(response.total);
      this.totalPages.set(response.totalPages);
    });
  }

  private readPageFromUrl(): number {
    const rawPage = Number(this.route.snapshot.queryParamMap.get('page') ?? '1');
    return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  }

  private setPageState(page: number): void {
    this.page.set(page);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
