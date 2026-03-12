import { Injectable, signal } from '@angular/core';
import { createId } from '@streaming-platform/utils';

export interface ToastItem {
  id: string;
  tone: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastStore {
  readonly items = signal<ToastItem[]>([]);

  show(message: string, tone: ToastItem['tone'] = 'info'): void {
    const item = { id: createId('toast'), message, tone };
    this.items.update((items) => [...items, item]);
    window.setTimeout(() => this.dismiss(item.id), 3200);
  }

  dismiss(id: string): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }
}
