import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoryWithProducts } from './category-resolver';
import { PageMetadata } from '../../core/seo/page-metadata';
import { NotFoundPage } from '../not-found/not-found-page';

@Component({
  selector: 'app-category-page',
  imports: [NotFoundPage, RouterLink],
  templateUrl: './category-page.html',
  styleUrl: './category-page.scss',
})
export class CategoryPage {
  readonly category = input<CategoryWithProducts | null>(null);

  private readonly metadata = inject(PageMetadata);

  constructor() {
    effect(() => {
      const view = this.category();

      if (view) {
        this.metadata.apply({
          title: view.category.name,
          path: `/category/${view.category.id}`,
          description: `${view.category.name} — меблева фурнітура в каталозі LioMebli.`,
        });
      }
    });
  }
}
