import { Component, computed, input } from '@angular/core';

import { telHref } from '../../core/site-contact';
import { SelectionLink } from '../selection-link/selection-link';

@Component({
  selector: 'app-sticky-action-bar',
  imports: [SelectionLink],
  templateUrl: './sticky-action-bar.html',
  styleUrl: './sticky-action-bar.scss',
})
export class StickyActionBar {
  readonly selectionCount = input<number>();

  readonly selectionLink = input<string>();

  readonly phone = input.required<string>();

  protected readonly callHref = computed(() => telHref(this.phone()));
}
