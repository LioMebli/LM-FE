import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

export interface BannerImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-hero-banner',
  imports: [NgOptimizedImage],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.scss',
})
export class HeroBanner {
  readonly heading = input.required<string>();

  readonly lede = input.required<string>();

  readonly image = input<BannerImage>();
}
