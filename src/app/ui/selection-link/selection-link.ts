import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-selection-link',
  imports: [RouterLink],
  templateUrl: './selection-link.html',
  styleUrl: './selection-link.scss',
})
export class SelectionLink {
  readonly count = input<number>();

  readonly link = input<string>();

  protected readonly selection = computed(() => {
    const count = this.count();
    const link = this.link();

    return count !== undefined && link !== undefined ? { count, link } : null;
  });
}
