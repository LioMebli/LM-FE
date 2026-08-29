import { Component, inject, signal } from '@angular/core';

import { PageMetadata } from '../../core/seo/page-metadata';
import { Availability } from '../../core/api/catalog.types';
import { ActionButton } from '../../ui/action-button/action-button';
import { AvailabilityLabel } from '../../ui/availability-label/availability-label';
import { BreadcrumbTrail } from '../../ui/breadcrumb-trail/breadcrumb-trail';
import { CheckboxRow } from '../../ui/checkbox-row/checkbox-row';
import { FilterChip } from '../../ui/filter-chip/filter-chip';
import { FilterSheet } from '../../ui/filter-sheet/filter-sheet';
import { PaginationLink } from '../../ui/pagination-link/pagination-link';
import { ProductCard } from '../../ui/product-card/product-card';
import { SocialProfile } from '../../ui/shell.types';
import { SiteFooter } from '../../ui/site-footer/site-footer';
import { StickyActionBar } from '../../ui/sticky-action-bar/sticky-action-bar';
import { TextField } from '../../ui/text-field/text-field';
import { VariantBadge } from '../../ui/variant-badge/variant-badge';

export type TokenSample =
  | 'colour'
  | 'border'
  | 'family'
  | 'size'
  | 'leading'
  | 'weight'
  | 'space'
  | 'radius';

export interface TokenGroup {
  title: string;
  sample: TokenSample;
  names: string[];
}

export const TOKEN_GROUPS: readonly TokenGroup[] = [
  {
    title: 'Колір',
    sample: 'colour',
    names: [
      '--lm-color-page',
      '--lm-color-surface',
      '--lm-color-ink',
      '--lm-color-ink-muted',
      '--lm-color-on-dark',
      '--lm-color-primary',
      '--lm-color-link',
      '--lm-color-error',
      '--lm-color-success',
    ],
  },
  {
    title: 'Рамка',
    sample: 'border',
    names: ['--lm-border-hairline', '--lm-border-control'],
  },
  { title: 'Гарнітура заголовків', sample: 'family', names: ['--lm-font-display'] },
  {
    title: 'Кегль',
    sample: 'size',
    names: ['--lm-text-sm', '--lm-text-md', '--lm-text-lg', '--lm-text-xl'],
  },
  { title: 'Інтерліньяж', sample: 'leading', names: ['--lm-leading-body', '--lm-leading-display'] },
  { title: 'Накреслення', sample: 'weight', names: ['--lm-weight-regular', '--lm-weight-bold'] },
  { title: 'Відступ', sample: 'space', names: ['--lm-space-xs', '--lm-space-sm', '--lm-space-md'] },
  {
    title: 'Зона дотику',
    sample: 'space',
    names: ['--lm-tap-target-min', '--lm-tap-target-chip', '--lm-tap-target-footer'],
  },
  { title: 'Ширина змісту', sample: 'space', names: ['--lm-content-max'] },
  {
    title: 'Радіус',
    sample: 'radius',
    names: ['--lm-radius-md', '--lm-radius-lg', '--lm-radius-pill'],
  },
];

export const SHOWCASE_TOKEN_NAMES: readonly string[] = TOKEN_GROUPS.flatMap(
  (group) => group.names,
);

interface ShowcaseCard {
  name: string;
  price: number;
  availability: Availability;
  variantCount: number;
}

const SHOWCASE_CARDS: readonly ShowcaseCard[] = [
  { name: 'Змішувач кухонний', price: 980, availability: 'IN_STOCK', variantCount: 1 },
  {
    name: 'Мийка гранітна 510×450 мм, антрацит',
    price: 4850,
    availability: 'IN_STOCK',
    variantCount: 6,
  },
  {
    name: 'Панель стінова, вугільний камінь',
    price: 1340,
    availability: 'DISCONTINUED',
    variantCount: 1,
  },
  {
    name: 'Комплектація кухні під ключ: фурнітура, мийка, змішувач і стільниця',
    price: 104800,
    availability: 'MADE_TO_ORDER',
    variantCount: 1,
  },
];

const SHOWCASE_SOCIALS: readonly SocialProfile[] = [
  { network: 'Instagram', href: 'https://www.instagram.com/' },
  { network: 'Facebook', href: 'https://www.facebook.com/' },
  { network: 'Telegram', href: 'https://telegram.org/' },
  { network: 'Viber', href: 'https://www.viber.com/' },
];

const SHOWCASE_AVAILABILITY: readonly Availability[] = [
  'IN_STOCK',
  'MADE_TO_ORDER',
  'DISCONTINUED',
];

@Component({
  selector: 'app-design-system-page',
  imports: [
    ActionButton,
    AvailabilityLabel,
    BreadcrumbTrail,
    CheckboxRow,
    FilterChip,
    FilterSheet,
    PaginationLink,
    ProductCard,
    SiteFooter,
    StickyActionBar,
    TextField,
    VariantBadge,
  ],
  templateUrl: './design-system-page.html',
  styleUrl: './design-system-page.scss',
})
export class DesignSystemPage {
  protected readonly tokenGroups = TOKEN_GROUPS;
  protected readonly cards = SHOWCASE_CARDS;
  protected readonly availabilityStates = SHOWCASE_AVAILABILITY;
  protected readonly socials = SHOWCASE_SOCIALS;

  protected readonly lastAction = signal('нічого ще не натиснуто');

  private readonly metadata = inject(PageMetadata);

  constructor() {
    this.metadata.apply({
      title: 'Дизайн-система',
      path: '/design-system',
      noindex: true,
    });
  }

  protected sampleOf(name: string): string {
    return `var(${name})`;
  }

  protected record(action: string): void {
    this.lastAction.set(action);
  }
}
