import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { NavDestination, SiteHeader } from './ui/site-header/site-header';

const SEARCH_PARAM = 'q';

const DESTINATIONS: readonly NavDestination[] = [{ label: 'Каталог', link: '/' }];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader],
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
