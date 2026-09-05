import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

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

  protected readonly inFlow = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly sheet = viewChild.required<ElementRef<HTMLDialogElement>>('sheet');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const read = () => this.inFlow.set(this.readInFlowFlag());

      read();
      window.addEventListener('resize', read);
      destroyRef.onDestroy(() => window.removeEventListener('resize', read));
    });
  }

  open(): void {
    this.sheet().nativeElement.showModal();
  }

  close(): void {
    this.sheet().nativeElement.close();
  }

  private readInFlowFlag(): boolean {
    const flag = getComputedStyle(this.host.nativeElement).getPropertyValue('--lm-sheet-inflow');
    return flag.trim() === '1';
  }
}
