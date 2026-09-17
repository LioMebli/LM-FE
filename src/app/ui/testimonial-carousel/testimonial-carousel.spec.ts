import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { Testimonial, TestimonialCarousel } from './testimonial-carousel';

const TESTIMONIALS: Testimonial[] = [
  { quote: 'Зробили нашу кухню серцем дому.', author: 'Олена та Іван Т., Харків' },
  { quote: 'Замір, проєкт і монтаж — усе точно в строк.', author: 'Андрій П., Полтава' },
  { quote: 'Через два роки фасади як у перший день.', author: 'Марія К., Львів' },
];

describe('TestimonialCarousel', () => {
  let fixture: ComponentFixture<TestimonialCarousel>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(TestimonialCarousel);
    host = fixture.nativeElement as HTMLElement;
  });

  it('holds every testimonial at once, so its height does not change as it moves', async () => {
    fixture.componentRef.setInput('testimonials', TESTIMONIALS);
    await fixture.whenStable();

    expect(host.querySelectorAll('.carousel__slide')).toHaveLength(3);
    expect(host.querySelectorAll('.carousel__pick')).toHaveLength(3);
  });

  it('moves to the testimonial whose control was pressed', async () => {
    fixture.componentRef.setInput('testimonials', TESTIMONIALS);
    await fixture.whenStable();

    host.querySelectorAll<HTMLButtonElement>('.carousel__pick')[2].click();
    await fixture.whenStable();

    const current = host.querySelectorAll('.carousel__pick')[2];

    expect(current.getAttribute('aria-current')).toBe('true');
    expect(host.querySelector('.carousel__track')?.getAttribute('style')).toContain('--shown: 2');
  });

  it('offers no controls for a single testimonial, because there is nowhere to go', async () => {
    fixture.componentRef.setInput('testimonials', [TESTIMONIALS[0]]);
    await fixture.whenStable();

    expect(host.querySelectorAll('.carousel__slide')).toHaveLength(1);
    expect(host.querySelectorAll('.carousel__pick')).toHaveLength(0);
    expect(host.querySelector('.carousel__dots')).toBeNull();
  });

  it('renders no slide and no control when it was given nothing', async () => {
    fixture.componentRef.setInput('testimonials', []);
    await fixture.whenStable();

    expect(host.querySelectorAll('.carousel__slide')).toHaveLength(0);
    expect(host.querySelector('.carousel__dots')).toBeNull();
  });

  it('advances on its own while nobody has touched it, and keeps its period', () => {
    mount(TESTIMONIALS, { stillness: false });

    tick(6000);

    expect(shown()).toBe(1);

    tick(6000);

    expect(shown()).toBe(2);
  });

  it('stops advancing for good once somebody has touched it', () => {
    mount(TESTIMONIALS, { stillness: false });

    host.querySelectorAll<HTMLButtonElement>('.carousel__pick')[0].click();
    fixture.detectChanges();

    tick(6000 * 5);

    expect(shown()).toBe(0);
  });

  it('never starts when the visitor asked for stillness, because an interval is motion too', () => {
    mount(TESTIMONIALS, { stillness: true });

    tick(6000 * 5);

    expect(shown()).toBe(0);
  });

  it('never starts for a single testimonial, because there is nowhere to advance to', () => {
    mount([TESTIMONIALS[0]], { stillness: false });

    tick(6000 * 5);

    expect(shown()).toBe(0);
  });

  it('hides every testimonial but the one on show from a screen reader', async () => {
    fixture.componentRef.setInput('testimonials', TESTIMONIALS);
    await fixture.whenStable();

    const hidden = [...host.querySelectorAll('.carousel__slide')].map((slide) =>
      slide.getAttribute('aria-hidden'),
    );

    expect(hidden).toEqual(['false', 'true', 'true']);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function mount(testimonials: readonly Testimonial[], { stillness }: { stillness: boolean }): void {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: stillness && query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));

    fixture.componentRef.setInput('testimonials', testimonials);
    fixture.detectChanges();
  }

  function tick(ms: number): void {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  }

  function shown(): number {
    const track = host.querySelector<HTMLElement>('.carousel__track')!;

    return Number(track.style.getPropertyValue('--shown'));
  }
});
