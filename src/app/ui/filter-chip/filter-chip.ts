import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-chip',
  templateUrl: './filter-chip.html',
  styleUrl: './filter-chip.scss',
})
export class FilterChip {
  readonly label = input.required<string>();

  /**
   * The spoken form of the filter, when the visible label does not read aloud —
   * «800–5 000 ₴» becomes «ціна від 800 до 5 000 гривень». Defaults to the visible label.
   */
  readonly spokenAs = input<string>();

  readonly removed = output<void>();

  protected readonly removeLabel = computed(
    () => `Прибрати фільтр: ${this.spokenAs() ?? this.label()}`,
  );
}
