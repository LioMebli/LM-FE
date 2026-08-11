import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageMetadata } from '../../core/seo/page-metadata';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {
  private readonly metadata = inject(PageMetadata);

  constructor() {
    this.metadata.apply({
      title: 'Сторінку не знайдено',
      path: '/404',
      noindex: true,
    });
  }
}
