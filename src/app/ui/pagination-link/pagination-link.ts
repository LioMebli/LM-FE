import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type PaginationLinkKind = 'number' | 'next';

@Component({
  selector: 'app-pagination-link',
  imports: [RouterLink],
  templateUrl: './pagination-link.html',
  styleUrl: './pagination-link.scss',
})
export class PaginationLink {
  readonly label = input.required<string>();

  readonly link = input<string>('');

  readonly current = input(false);
  readonly kind = input<PaginationLinkKind>('number');
}
