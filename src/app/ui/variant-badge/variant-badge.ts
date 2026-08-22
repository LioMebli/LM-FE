import { Component, input } from '@angular/core';

/**
 * The panel over a product photograph naming how many variants the product has.
 *
 * Its placement is the caller's, not its own: it carries no position, so whoever puts it over
 * an image decides where on that image it sits.
 */
@Component({
  selector: 'app-variant-badge',
  templateUrl: './variant-badge.html',
  styleUrl: './variant-badge.scss',
})
export class VariantBadge {
  readonly count = input.required<number>();
}
