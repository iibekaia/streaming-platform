import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppLanguage, I18nService } from '../i18n/i18n.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { SiGlobeAltIcon, SiLanguageIcon } from '@semantic-icons/heroicons/24/outline';

type FooterVariant = 'platform' | 'dashboard';

@Component({
  selector: 'ui-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, SiGlobeAltIcon, SiLanguageIcon],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  private readonly i18n = inject(I18nService);

  readonly variant = input<FooterVariant>('platform');

  protected readonly year = new Date().getFullYear();
  protected readonly languages: AppLanguage[] = ['en', 'ka', 'uk'];
  protected readonly currentLanguage = this.i18n.language;
  protected readonly title = computed(() =>
    this.variant() === 'platform' ? this.i18n.translate('footer.platformTitle', 'Streaming Platform') : this.i18n.translate('footer.dashboardTitle', 'Streaming Dashboard'),
  );
  protected readonly description = computed(() =>
    this.variant() === 'platform'
      ? this.i18n.translate('footer.platformDescription', 'Browse films, manage access, and keep your watchlist organized.')
      : this.i18n.translate('footer.dashboardDescription', 'Operate catalog, pricing, and users from one admin workspace.'),
  );
  protected readonly links = computed(() =>
    this.variant() === 'platform'
      ? [
          { label: this.i18n.translate('nav.movies', 'Movies'), href: '/movies' },
          { label: this.i18n.translate('nav.plans', 'Plans'), href: '/plans' },
          { label: this.i18n.translate('nav.account', 'Account'), href: '/account' },
        ]
      : [
          { label: this.i18n.translate('nav.dashboard', 'Dashboard'), href: '/dashboard' },
          { label: this.i18n.translate('nav.movies', 'Movies'), href: '/movies' },
          { label: this.i18n.translate('nav.users', 'Users'), href: '/users' },
        ],
  );

  switchLanguage(language: AppLanguage): void {
    void this.i18n.setLanguage(language);
  }

  languageLabel(language: AppLanguage): string {
    return this.i18n.languageLabel(language);
  }
}
