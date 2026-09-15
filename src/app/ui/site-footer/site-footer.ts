import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavDestination, SocialProfile } from '../shell.types';
import { BrandMark } from '../brand-mark/brand-mark';

@Component({
  selector: 'app-site-footer',
  imports: [BrandMark, RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  readonly destinations = input.required<readonly NavDestination[]>();

  readonly phone = input<string>();

  readonly address = input<string>();

  readonly email = input<string>();

  readonly socials = input<readonly SocialProfile[]>([]);

  protected readonly callHref = computed(() => `tel:${this.phone()}`);

  protected readonly mailHref = computed(() => `mailto:${this.email()}`);

  protected readonly hasContacts = computed(() =>
    Boolean(this.phone() ?? this.address() ?? this.email()),
  );
}
