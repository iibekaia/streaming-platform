import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter } from 'rxjs';

export interface SeoConfig {
  title: string;
  description: string;
  robots?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  init(defaults: SeoConfig): void {
    this.apply(defaults);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.deepestRoute(this.route);
        const seo = route.snapshot.data['seo'] as Partial<SeoConfig> | undefined;

        this.apply({
          title: seo?.title ?? defaults.title,
          description: seo?.description ?? defaults.description,
          robots: seo?.robots ?? defaults.robots ?? 'noindex, nofollow',
        });
      });
  }

  private apply(config: SeoConfig): void {
    this.title.setTitle(config.title);
    this.updateTag('name', 'description', config.description);
    this.updateTag('name', 'robots', config.robots ?? 'noindex, nofollow');
    this.updateTag('property', 'og:title', config.title);
    this.updateTag('property', 'og:description', config.description);
    this.updateTag('property', 'og:type', 'website');
    this.updateTag('property', 'og:url', this.currentUrl());
    this.updateTag('name', 'twitter:card', 'summary_large_image');
    this.updateTag('name', 'twitter:title', config.title);
    this.updateTag('name', 'twitter:description', config.description);
    this.updateCanonical(this.currentUrl());
  }

  private updateTag(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content });
  }

  private updateCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private currentUrl(): string {
    return `${this.document.location.origin}${this.router.url}`;
  }

  private deepestRoute(route: ActivatedRoute): ActivatedRoute {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}
