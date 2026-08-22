import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbStep {
  label: string;
  /** Absent on the last step — the page a visitor is already on is not a link to itself. */
  link?: string;
}

@Component({
  selector: 'app-breadcrumb-trail',
  imports: [RouterLink],
  templateUrl: './breadcrumb-trail.html',
  styleUrl: './breadcrumb-trail.scss',
})
export class BreadcrumbTrail {
  readonly steps = input.required<BreadcrumbStep[]>();
  readonly label = input('Навігація розділами');
}
