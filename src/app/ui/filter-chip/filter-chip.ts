import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-chip',
  templateUrl: './filter-chip.html',
  styleUrl: './filter-chip.scss',
})
export class FilterChip {
  readonly label = input.required<string>();

  readonly spokenAs = input<string>();

  readonly removed = output<void>();

  protected readonly removeLabel = computed(
    () => `Прибрати фільтр: ${this.spokenAs() ?? this.label()}`,
  );
}
