import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavDestination } from '../site-header/site-header';

export interface SocialProfile {
  network: string;
  href: string;
}

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  readonly destinations = input.required<readonly NavDestination[]>();

  readonly phone = input<string>();

  readonly socials = input<readonly SocialProfile[]>([]);

  protected readonly callHref = computed(() => `tel:${this.phone()}`);
}
