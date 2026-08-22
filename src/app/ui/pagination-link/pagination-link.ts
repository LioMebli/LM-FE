import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** The two variants the reference screen carried: five numbers and one «Далі». */
export type PaginationLinkKind = 'number' | 'next';

@Component({
  selector: 'app-pagination-link',
  imports: [RouterLink],
  templateUrl: './pagination-link.html',
  styleUrl: './pagination-link.scss',
})
export class PaginationLink {
  readonly label = input.required<string>();

  /** Ignored while the link is current: the page a visitor is on is not a link to itself. */
  readonly link = input<string>('');

  readonly current = input(false);
  readonly kind = input<PaginationLinkKind>('number');
}
