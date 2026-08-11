import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoryResponse } from '../../core/api/catalog.types';
import { PageMetadata } from '../../core/seo/page-metadata';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  readonly categories = input<CategoryResponse[]>([]);

  private readonly metadata = inject(PageMetadata);

  constructor() {
    this.metadata.apply({
      title: 'Каталог',
      path: '/',
      description: 'Меблева фурнітура: ручки, петлі, напрямні та інші комплектуючі.',
    });
  }
}
