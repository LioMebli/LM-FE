import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-checkbox-row',
  templateUrl: './checkbox-row.html',
  styleUrl: './checkbox-row.scss',
})
export class CheckboxRow {
  readonly label = input.required<string>();
  readonly checked = model(false);

  protected toggle(event: Event): void {
    this.checked.set((event.target as HTMLInputElement).checked);
  }
}
