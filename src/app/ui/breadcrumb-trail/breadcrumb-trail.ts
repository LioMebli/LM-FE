import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbStep {
  label: string;
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
