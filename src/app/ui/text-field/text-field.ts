import { Component, input, output } from '@angular/core';

let nextMessageId = 0;

@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
})
export class TextField {
  readonly label = input.required<string>();

  readonly error = input<string>();

  readonly inputmode = input('text');

  readonly value = input('');

  readonly valueChanged = output<string>();

  protected readonly messageId = `text-field-message-${nextMessageId++}`;

  protected report(target: EventTarget | null): void {
    this.valueChanged.emit((target as HTMLInputElement).value);
  }
}
