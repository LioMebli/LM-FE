import { DOCUMENT, Service, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';

const SITE_NAME = 'LioMebli';

export interface PageMetadataInput {
  title: string;
  path: string;
  description?: string;
  noindex?: boolean;
}

@Service()
export class PageMetadata {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  apply(page: PageMetadataInput): void {
    this.title.setTitle(`${page.title} — ${SITE_NAME}`);
    this.setOrRemove('description', page.description);
    this.setOrRemove('robots', page.noindex ? 'noindex' : undefined);
    this.setCanonical(page.path);
  }

  private setOrRemove(name: string, content: string | undefined): void {
    if (content) {
      this.meta.updateTag({ name, content });
    } else {
      this.meta.removeTag(`name="${name}"`);
    }
  }

  private setCanonical(path: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      head.appendChild(link);
    }

    link.href = `${environment.siteOrigin}${path}`;
  }
}
