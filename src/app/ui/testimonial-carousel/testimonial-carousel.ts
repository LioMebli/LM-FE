import { Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core';

export interface Testimonial {
  quote: string;
  author: string;
}

const AUTOPLAY_MS = 6000;

@Component({
  selector: 'app-testimonial-carousel',
  imports: [],
  templateUrl: './testimonial-carousel.html',
  styleUrl: './testimonial-carousel.scss',
})
export class TestimonialCarousel {
  readonly testimonials = input.required<readonly Testimonial[]>();

  protected readonly index = signal(0);

  protected readonly interrupted = signal(false);

  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    afterNextRender(() => this.startUnlessAskedNotTo());
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected show(index: number): void {
    this.interrupted.set(true);
    this.stop();
    this.index.set(index);
  }

  private startUnlessAskedNotTo(): void {
    const stillness = matchMedia('(prefers-reduced-motion: reduce)');

    if (stillness.matches || this.testimonials().length < 2) {
      return;
    }

    this.timer = setInterval(() => this.advance(), AUTOPLAY_MS);
  }

  private advance(): void {
    this.index.update((current) => (current + 1) % this.testimonials().length);
  }

  private stop(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
