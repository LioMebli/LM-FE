import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sticky-action-bar',
  imports: [RouterLink],
  templateUrl: './sticky-action-bar.html',
  styleUrl: './sticky-action-bar.scss',
})
export class StickyActionBar {
  readonly selectionCount = input<number>();

  readonly selectionLink = input<string>();

  readonly phone = input.required<string>();

  protected readonly callHref = computed(() => `tel:${this.phone()}`);

  protected readonly selection = computed(() => {
    const count = this.selectionCount();
    const link = this.selectionLink();

    return count !== undefined && link !== undefined ? { count, link } : null;
  });
}
