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
  protected readonly slugify = slugify;
  protected readonly form = this.fb.nonNullable.group({
    name: [''],
    description: [''],
    color: ['#4f46e5'],
  });

  constructor() {
    this.refresh();
  }

  edit(category: Category): void {
    this.selectedId.set(category.id);
    this.form.patchValue({
      name: category.name,
      description: category.description ?? '',
      color: category.color ?? '#4f46e5',
    });
  }

  save(): void {
    const value = this.form.getRawValue();
    this.categoriesApi.save({ id: this.selectedId() ?? undefined, ...value }).subscribe(() => {
      this.selectedId.set(null);
      this.form.reset({ name: '', description: '', color: '#4f46e5' });
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
