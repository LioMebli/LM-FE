import { Component, inject, input } from '@angular/core';

import { CategoryResponse } from '../../core/api/catalog.types';
import { PageMetadata } from '../../core/seo/page-metadata';
import { CategoryCard } from '../../ui/category-card/category-card';
import { HeroBanner } from '../../ui/hero-banner/hero-banner';

const HEADING = 'Меблева фурнітура';

const LEDE = 'Ручки, петлі, напрямні та комплектуючі — для майстерень і для власних проєктів.';

@Component({
  selector: 'app-home-page',
  imports: [CategoryCard, HeroBanner],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  readonly categories = input<CategoryResponse[]>([]);

  protected readonly heading = HEADING;

  protected readonly lede = LEDE;

  private readonly metadata = inject(PageMetadata);

  constructor() {
    this.metadata.apply({
      title: HEADING,
      path: '/',
      description: 'Меблева фурнітура: ручки, петлі, напрямні та інші комплектуючі.',
    });
  }
}
