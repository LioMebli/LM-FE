import { Component, ElementRef, input, output, viewChild } from '@angular/core';

/**
 * The filter panel, and the control that opens it. Its two states are closed and open, and the
 * opener is what "closed" looks like — which is why the component inventory counts them as one
 * piece rather than two.
 *
 * A `<dialog>`, for the focus trap and for Esc. Being in the top layer is also why the sticky
 * bar cannot cover a field being typed into.
 */
@Component({
  selector: 'app-filter-sheet',
  templateUrl: './filter-sheet.html',
  styleUrl: './filter-sheet.scss',
})
export class FilterSheet {
  readonly heading = input('Фільтри');

  /** Shown on the opener. Zero hides the counter rather than showing a zero. */
  readonly activeCount = input(0);

  /** Names the result, «Показати 128 товарів» — a count is what makes applying worth a tap. */
  readonly applyLabel = input.required<string>();

  readonly closed = output<void>();

  private readonly sheet = viewChild.required<ElementRef<HTMLDialogElement>>('sheet');

  open(): void {
    this.sheet().nativeElement.showModal();
  }

  close(): void {
    this.sheet().nativeElement.close();
  }
}
