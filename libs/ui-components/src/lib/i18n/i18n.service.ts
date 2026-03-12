import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type AppLanguage = 'en' | 'ka' | 'uk';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'sp.language';

  readonly language = signal<AppLanguage>('en');
  readonly dictionary = signal<Record<string, unknown>>({});
  readonly ready = computed(() => Object.keys(this.dictionary()).length > 0);

  async init(): Promise<void> {
    await this.setLanguage(this.readStoredLanguage(), false);
  }

  async setLanguage(language: AppLanguage, persist = true): Promise<void> {
    const dictionary = await firstValueFrom(
      this.http.get<Record<string, unknown>>(`/i18n/${language}.json`),
    );

    this.language.set(language);
    this.dictionary.set(dictionary);

    if (persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, language);
    }
  }

  translate(key: string, fallback?: string): string {
    const value = key
      .split('.')
      .reduce<unknown>((current, part) => (current && typeof current === 'object' ? (current as Record<string, unknown>)[part] : undefined), this.dictionary());

    return typeof value === 'string' ? value : (fallback ?? key);
  }

  languageLabel(language: AppLanguage): string {
    return {
      en: 'English',
      ka: 'ქართული',
      uk: 'Українська',
    }[language];
  }

  private readStoredLanguage(): AppLanguage {
    if (typeof localStorage === 'undefined') {
      return 'en';
    }

    const stored = localStorage.getItem(this.storageKey);
    return stored === 'ka' || stored === 'uk' || stored === 'en' ? stored : 'en';
  }
}
