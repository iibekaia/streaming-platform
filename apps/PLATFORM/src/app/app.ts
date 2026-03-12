import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SeoService, ToastOutletComponent } from '@streaming-platform/ui-components';
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
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.init({
      title: 'Streaming Platform Login',
      description: 'Sign in to access your streaming library, purchased tickets, and subscription features.',
      robots: 'noindex, nofollow',
    });
    this.sessionSync.init();
  }
}
