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

const PRICE = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });

@Component({
  selector: 'app-product-card',
  imports: [AvailabilityLabel, NgOptimizedImage, RouterLink, VariantBadge],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly name = input.required<string>();

  readonly price = input.required<number>();

  readonly availability = input.required<Availability>();
  readonly link = input.required<string>();

  readonly image = input<ProductCardImage>();

  readonly variantCount = input(1);

  readonly addedToSelection = output<void>();

  protected readonly formattedPrice = computed(() => `${PRICE.format(this.price())} ₴`);
}
