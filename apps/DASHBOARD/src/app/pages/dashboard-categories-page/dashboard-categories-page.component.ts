import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryApiService } from '@streaming-platform/api-services';
import { Category } from '@streaming-platform/data-models';
import { ModalComponent, ToastStore } from '@streaming-platform/ui-components';
import { slugify } from '@streaming-platform/utils';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './dashboard-categories-page.component.html',
})
export class DashboardCategoriesPageComponent {
  private readonly categoriesApi = inject(CategoryApiService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastStore);

  protected readonly categories = signal<Array<Category & { movieCount: number }>>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly isModalOpen = signal(false);
  protected readonly page = signal(1);
  protected readonly pageSize = 8;
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly slugify = slugify;
  protected readonly pageLabel = computed(() => `Page ${this.page()} of ${this.totalPages()}`);
  protected readonly visiblePages = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.page();
    const end = Math.min(totalPages, Math.max(5, currentPage + 2));
    const start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });
  protected readonly form = this.fb.nonNullable.group({
    name: [''],
    description: [''],
    color: ['#4f46e5'],
  });

  constructor() {
    this.page.set(this.readPageFromUrl());
    this.refresh();
  }

  openModal(category?: Category): void {
    this.isModalOpen.set(true);
    this.selectedId.set(category?.id ?? null);
    this.form.patchValue({
      name: category?.name ?? '',
      description: category?.description ?? '',
      color: category?.color ?? '#4f46e5',
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedId.set(null);
    this.form.reset({ name: '', description: '', color: '#4f46e5' });
  }

  edit(category: Category): void {
    this.openModal(category);
  }

  save(): void {
    const value = this.form.getRawValue();
    this.categoriesApi.save({ id: this.selectedId() ?? undefined, ...value }).subscribe(() => {
      this.closeModal();
      this.refresh();
    });
  }

  remove(categoryId: string): void {
    this.categoriesApi.delete(categoryId).subscribe({
      next: () => {
        this.toasts.show('Category deleted.', 'success');
        this.refresh();
      },
      error: (error) => {
        this.toasts.show(error?.error?.message ?? 'Category could not be deleted.', 'error');
      },
    });
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || nextPage > this.totalPages() || nextPage === this.page()) {
      return;
    }

    this.setPageState(nextPage);
    this.refresh();
  }

  private refresh(): void {
    this.categoriesApi.list({ page: this.page(), pageSize: this.pageSize }).subscribe((response) => {
      this.categories.set(response.items);
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
