import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AdminApiService } from '@streaming-platform/api-services';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-plans-page.component.html',
})
export class DashboardPlansPageComponent {
  private readonly adminApi = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    unlimitedMonthlyPrice: [19],
    defaultTicketPrice: [8],
  });

  constructor() {
    this.adminApi.getPlanConfig().subscribe((config) => this.form.patchValue(config));
  }

  save(): void {
    this.adminApi.savePlanConfig(this.form.getRawValue()).subscribe();
  }
}
