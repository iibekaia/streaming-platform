import { CommonModule, NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  readonly overlayClass = input('bg-slate-950/45');
  readonly panelClass = input('max-w-2xl bg-white');
  readonly position = input<'top' | 'center'>('top');
  readonly headerClass = input('');
  readonly contentClass = input('');
  readonly actionsClass = input('');
}
