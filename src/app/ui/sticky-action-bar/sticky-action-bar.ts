import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sticky-action-bar',
  imports: [RouterLink],
  templateUrl: './sticky-action-bar.html',
  styleUrl: './sticky-action-bar.scss',
})
export class StickyActionBar {
  readonly selectionCount = input.required<number>();

  /**
   * Where the selection opens. There is no selection route yet — it arrives with the selection
   * code flow — so the caller supplies one rather than this component naming a page that does
   * not exist.
   */
  readonly selectionLink = input.required<string>();

  /** Digits only, in international form: `+380671234567`. */
  readonly phone = input.required<string>();

  protected readonly callHref = computed(() => `tel:${this.phone()}`);
}
