import { Component, input, output } from '@angular/core';

export type ActionButtonVariant = 'primary' | 'secondary';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.html',
  styleUrl: './action-button.scss',
})
export class ActionButton {
  readonly variant = input<ActionButtonVariant>('secondary');

  readonly type = input<'button' | 'submit'>('button');

  readonly pressed = output<void>();
}
