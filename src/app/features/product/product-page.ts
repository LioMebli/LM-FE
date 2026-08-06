import { Component, effect, inject, input } from '@angular/core';

import { AVAILABILITY_LABELS, ProductDetail } from '../../core/api/catalog.types';
import { PageMetadata } from '../../core/seo/page-metadata';
import { NotFoundPage } from '../not-found/not-found-page';

const DESCRIPTION_LIMIT = 160;

@Component({
  selector: 'app-product-page',
  imports: [NotFoundPage],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage {
  readonly product = input<ProductDetail | null>(null);

  protected readonly availabilityLabels = AVAILABILITY_LABELS;

  private readonly metadata = inject(PageMetadata);

  constructor() {
    effect(() => {
      const item = this.product();

      if (item) {
        this.metadata.apply({
          title: item.name,
          path: `/product/${item.id}`,
          description: metaDescription(item),
        });
      }
    });
  }
}

function metaDescription(product: ProductDetail): string | undefined {
  if (product.shortDescription) {
    return product.shortDescription;
  }

  return product.description ? shortenToWholeWord(product.description) : undefined;
}

function shortenToWholeWord(text: string): string {
  if (text.length <= DESCRIPTION_LIMIT) {
    return text;
  }

  const cut = text.slice(0, DESCRIPTION_LIMIT);
  const lastBreak = cut.lastIndexOf(' ');

  return lastBreak > 0 ? cut.slice(0, lastBreak) : cut;
}
