import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AvailabilityLabel } from '../availability-label/availability-label';
import { VariantBadge } from '../variant-badge/variant-badge';
import { Availability } from '../../core/api/catalog.types';

export interface ProductCardImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Money is whole hryvnia, so the formatter carries no fraction digits and the group separator
 * is the one uk-UA prescribes. Built once at module load: it is stateless and rebuilding it per
 * card is the expensive half of formatting.
 */
const PRICE = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });

@Component({
  selector: 'app-product-card',
  imports: [AvailabilityLabel, NgOptimizedImage, RouterLink, VariantBadge],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly name = input.required<string>();

  /** Whole hryvnia, never kopecks — an integer end to end, per the project's money rule. */
  readonly price = input.required<number>();

  readonly availability = input.required<Availability>();
  readonly link = input.required<string>();

  /** Absent until the media pipeline exists; the card draws an empty frame in its place. */
  readonly image = input<ProductCardImage>();

  /** A badge appears only above one, because «Варіантів: 1» tells a visitor nothing. */
  readonly variantCount = input(1);

  readonly addedToSelection = output<void>();

  protected readonly formattedPrice = computed(() => `${PRICE.format(this.price())} ₴`);
}
