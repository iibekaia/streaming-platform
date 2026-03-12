import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AdminApiService } from '@streaming-platform/api-services';
import { AnalyticsSummary } from '@streaming-platform/data-models';
import { formatPrice } from '@streaming-platform/utils';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home-page.component.html',
})
export class DashboardHomePageComponent {
  private readonly adminApi = inject(AdminApiService);

  protected readonly summary = signal<AnalyticsSummary | null>(null);
  protected stats: Array<{ label: string; value: string | number }> = [];

  constructor() {
    this.adminApi.analytics().subscribe((summary) => {
      this.summary.set(summary);
      this.stats = [
        { label: 'Total users', value: summary.totalUsers },
        { label: 'Active subscriptions', value: summary.activeSubscriptions },
        { label: 'Tickets sold', value: summary.totalTicketsSold },
        { label: 'Revenue', value: formatPrice(summary.totalRevenue) },
      ];
    });
  }
}
