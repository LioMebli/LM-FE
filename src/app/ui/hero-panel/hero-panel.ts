import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { Photograph } from '../media.types';

@Component({
  selector: 'app-hero-panel',
  imports: [NgOptimizedImage],
  templateUrl: './hero-panel.html',
  styleUrl: './hero-panel.scss',
})
export class HeroPanel {
  readonly heading = input.required<string>();

  readonly lede = input.required<string>();

  readonly image = input<Photograph>();

  readonly headingLevel = input<number>(1);
}
