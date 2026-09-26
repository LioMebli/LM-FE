import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE } from './core/site-contact';
import { NavDestination } from './ui/shell.types';
import { SiteFooter } from './ui/site-footer/site-footer';
import { SiteHeader } from './ui/site-header/site-header';

const SEARCH_PARAM = 'q';

const DESTINATIONS: readonly NavDestination[] = [
  { label: 'Каталог', link: '/', fragment: 'projects' },
  { label: 'Про нас', link: '/', fragment: 'steps' },
  { label: 'Контакти', link: '/', fragment: 'foot' },
];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteFooter, SiteHeader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly destinations = DESTINATIONS;

  protected readonly selectionCount = 0;

  protected readonly phone = SITE_PHONE;

  protected readonly address = SITE_ADDRESS;

  protected readonly email = SITE_EMAIL;

  private readonly router = inject(Router);

  protected search(query: string): void {
    void this.router.navigate(['/'], { queryParams: { [SEARCH_PARAM]: query } });
  }
}
