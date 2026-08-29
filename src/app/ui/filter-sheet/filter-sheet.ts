import { Component, ElementRef, input, output, viewChild } from '@angular/core';

import { ActionButton } from '../action-button/action-button';

@Component({
  selector: 'app-filter-sheet',
  imports: [ActionButton],
  templateUrl: './filter-sheet.html',
  styleUrl: './filter-sheet.scss',
})
export class FilterSheet {
  readonly heading = input('Фільтри');

  readonly activeCount = input(0);

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
