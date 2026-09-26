import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { Photograph } from '../media.types';

@Component({
  selector: 'app-project-card',
  imports: [NgOptimizedImage],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  readonly name = input.required<string>();

  readonly lede = input.required<string>();

  readonly image = input<Photograph>();
}
