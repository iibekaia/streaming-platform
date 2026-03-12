import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastStore } from '../toast.store';

@Component({
  selector: 'ui-toast-outlet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-outlet.component.html',
})
export class ToastOutletComponent {
  protected readonly store = inject(ToastStore);
}
