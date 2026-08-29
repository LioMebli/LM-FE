import { Component, input, output } from '@angular/core';

export type InputMode = 'text' | 'numeric' | 'tel' | 'decimal' | 'email' | 'url' | 'search';

let nextMessageId = 0;

@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
})
export class TextField {
  readonly label = input.required<string>();

  readonly error = input<string>();

  readonly inputmode = input<InputMode>('text');

  readonly autocomplete = input('off');

  readonly value = input('');

  readonly valueChanged = output<string>();

  protected readonly messageId = `text-field-message-${nextMessageId++}`;

  protected report(target: EventTarget | null): void {
    this.valueChanged.emit((target as HTMLInputElement).value);
  }
}
