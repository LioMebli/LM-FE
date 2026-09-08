import { Component, input } from '@angular/core';

export interface BannerImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

@Component({
  selector: 'app-hero-banner',
  imports: [],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.scss',
})
export class HeroBanner {
  readonly heading = input.required<string>();

  readonly lede = input.required<string>();

  readonly image = input<BannerImage>();
}
