import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { NavDestination } from './ui/shell.types';
import { SiteFooter } from './ui/site-footer/site-footer';
import { SiteHeader } from './ui/site-header/site-header';

const SEARCH_PARAM = 'q';

const DESTINATIONS: readonly NavDestination[] = [{ label: 'Каталог', link: '/' }];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteFooter, SiteHeader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly destinations = DESTINATIONS;

  private readonly router = inject(Router);

  protected search(query: string): void {
    void this.router.navigate(['/'], { queryParams: { [SEARCH_PARAM]: query } });
  }
}
