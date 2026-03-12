import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CategoryApiService } from '@streaming-platform/api-services';
import { Category } from '@streaming-platform/data-models';
import { slugify } from '@streaming-platform/utils';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-categories-page.component.html',
})
export class DashboardCategoriesPageComponent {
  private readonly categoriesApi = inject(CategoryApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly categories = signal<Array<Category & { movieCount: number }>>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly isModalOpen = signal(false);
  protected readonly slugify = slugify;
  protected readonly form = this.fb.nonNullable.group({
    name: [''],
    description: [''],
    color: ['#4f46e5'],
  });

  constructor() {
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
    this.categoriesApi.delete(categoryId).subscribe(() => this.refresh());
  }

  private refresh(): void {
    this.categoriesApi.list().subscribe((categories) => this.categories.set(categories));
  }
}
