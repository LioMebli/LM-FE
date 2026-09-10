import { Component, inject, input } from '@angular/core';

import { CategoryResponse } from '../../core/api/catalog.types';
import { PageMetadata } from '../../core/seo/page-metadata';
import { SITE_PHONE } from '../../core/site-contact';
import { CategoryCard } from '../../ui/category-card/category-card';
import { HeroBanner } from '../../ui/hero-banner/hero-banner';
import { ProcessStep, ProcessSteps } from '../../ui/process-steps/process-steps';
import { StickyActionBar } from '../../ui/sticky-action-bar/sticky-action-bar';

const HEADING = 'Меблева фурнітура';

const LEDE = 'Ручки, петлі, напрямні та комплектуючі — для майстерень і для власних проєктів.';

const DESCRIPTION = 'Меблева фурнітура: ручки, петлі, напрямні та інші комплектуючі.';

const STEPS: readonly ProcessStep[] = [
  { label: 'Оберіть потрібне', detail: 'Знайдіть у каталозі й додайте до підбірки.' },
  { label: 'Отримайте код', detail: 'Підбірка отримує короткий код, який легко продиктувати.' },
  {
    label: 'Зателефонуйте',
    detail: 'Назвіть код — менеджер відкриє вашу підбірку й порахує вартість.',
  },
];

@Component({
  selector: 'app-home-page',
  imports: [CategoryCard, HeroBanner, ProcessSteps, StickyActionBar],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  readonly categories = input<CategoryResponse[]>([]);

  protected readonly heading = HEADING;

  protected readonly lede = LEDE;

  protected readonly phone = SITE_PHONE;

  protected readonly steps = STEPS;

  private readonly metadata = inject(PageMetadata);

  constructor() {
    this.metadata.apply({ title: HEADING, path: '/', description: DESCRIPTION });
  }
}
