import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastOutletComponent } from '@streaming-platform/ui-components';
import { SessionSyncService } from '@streaming-platform/auth-lib';

@Component({
  standalone: true,
  imports: [RouterOutlet, ToastOutletComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly sessionSync = inject(SessionSyncService);

  constructor() {
    this.sessionSync.init();
  }
}
