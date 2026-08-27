import { Component, inject, signal } from '@angular/core';

import { PageMetadata } from '../../core/seo/page-metadata';
import { Availability } from '../../core/api/catalog.types';
import { AvailabilityLabel } from '../../ui/availability-label/availability-label';
import { BreadcrumbTrail } from '../../ui/breadcrumb-trail/breadcrumb-trail';
import { CheckboxRow } from '../../ui/checkbox-row/checkbox-row';
import { FilterChip } from '../../ui/filter-chip/filter-chip';
import { FilterSheet } from '../../ui/filter-sheet/filter-sheet';
import { PaginationLink } from '../../ui/pagination-link/pagination-link';
import { ProductCard } from '../../ui/product-card/product-card';
import { StickyActionBar } from '../../ui/sticky-action-bar/sticky-action-bar';
import { VariantBadge } from '../../ui/variant-badge/variant-badge';

/** Which property of the sample element the token is poured into. */
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

/**
 * The names this page shows.
 *
 * It is a hand-written list, and the reason it is allowed to be one is that
 * `design-system-page.spec.ts` parses `src/styles/tokens.css` and fails when the two sets
 * differ. Rendering is the projection for the components below; a list of names is not markup,
 * so the same argument does not reach it, and a hand list rots the first time a token is
 * renamed. Deriving the list at build time would be stronger and is more machinery than
 * twenty-two values earn — see specs/LM-51/research.md R7.
 */
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
    ],
  },
  { title: 'Рамка', sample: 'border', names: ['--lm-border-hairline'] },
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

/**
 * Four cards, chosen to hold the states the reference screen proved the card has to survive: a
 * name of one line and a name of four in the same row, all three availability states, prices
 * from three digits to six, and a card with a variant badge beside cards without one.
 *
 * The names are plain descriptions and carry no brand, and no photograph travels with them —
 * the borrowed images stay in specs/LM-51/mockup/photos/ and the repository boundary is what
 * keeps them there (FR-007).
 */
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

const SHOWCASE_AVAILABILITY: readonly Availability[] = [
  'IN_STOCK',
  'MADE_TO_ORDER',
  'DISCONTINUED',
];

@Component({
  selector: 'app-design-system-page',
  imports: [
    AvailabilityLabel,
    BreadcrumbTrail,
    CheckboxRow,
    FilterChip,
    FilterSheet,
    PaginationLink,
    ProductCard,
    StickyActionBar,
    VariantBadge,
  ],
  templateUrl: './design-system-page.html',
  styleUrl: './design-system-page.scss',
})
export class DesignSystemPage {
  protected readonly tokenGroups = TOKEN_GROUPS;
  protected readonly cards = SHOWCASE_CARDS;
  protected readonly availabilityStates = SHOWCASE_AVAILABILITY;

  /** What the demonstrated controls did, so a visitor can see that they are wired, not drawn. */
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
