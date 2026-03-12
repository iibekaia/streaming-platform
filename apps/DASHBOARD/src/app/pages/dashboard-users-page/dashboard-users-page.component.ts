import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AdminApiService } from '@streaming-platform/api-services';
import { User } from '@streaming-platform/data-models';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-users-page.component.html',
})
export class DashboardUsersPageComponent {
  private readonly adminApi = inject(AdminApiService);
  protected readonly users = signal<Array<Omit<User, 'password'>>>([]);

  constructor() {
    this.refresh();
  }

  revoke(userId: string): void {
    this.adminApi.revokeSession(userId).subscribe(() => this.refresh());
  }

  toggle(userId: string): void {
    this.adminApi.toggleUserStatus(userId).subscribe(() => this.refresh());
  }

  private refresh(): void {
    this.adminApi.listUsers().subscribe((users) => this.users.set(users));
  }
}
