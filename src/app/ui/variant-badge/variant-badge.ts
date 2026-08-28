import { Component, input } from '@angular/core';

@Component({
  selector: 'app-variant-badge',
  templateUrl: './variant-badge.html',
  styleUrl: './variant-badge.scss',
})
export class VariantBadge {
  readonly count = input.required<number>();
}
