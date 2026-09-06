import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
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

  readonly applied = output<void>();

  readonly closed = output<void>();

  protected readonly standing = computed(() => this.inFlow() && !this.modal());

  private readonly inFlow = signal(false);

  private readonly modal = signal(false);

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
    const dialog = this.sheet().nativeElement;

    if (dialog.open) {
      return;
    }

    dialog.showModal();
    this.modal.set(true);
  }

  close(): void {
    if (this.standing()) {
      return;
    }

    this.sheet().nativeElement.close();
    this.modal.set(false);
  }

  protected apply(): void {
    this.applied.emit();
    this.close();
  }

  protected onClosed(): void {
    this.modal.set(false);
    this.closed.emit();
  }

  private readInFlowFlag(): boolean {
    const flag = getComputedStyle(this.host.nativeElement).getPropertyValue('--sheet-inflow');
    return flag.trim() === '1';
  }
}
