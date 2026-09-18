import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroPanel } from './hero-panel';

describe('HeroPanel', () => {
  let fixture: ComponentFixture<HeroPanel>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroPanel);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('heading', 'Lio Mebli');
    fixture.componentRef.setInput('lede', 'Створюємо простір, де кожен сантиметр має значення.');
  });

  it('opens the page with the heading as its only h1', () => {
    fixture.detectChanges();

    expect(host.querySelectorAll('h1')).toHaveLength(1);
    expect(host.querySelector('h1')?.textContent?.trim()).toBe('Lio Mebli');
  });

  it('draws no photograph while there is none, rather than an image with no source', () => {
    fixture.detectChanges();

    expect(host.querySelector('.hero__image')).toBeNull();
    expect(host.querySelector('.hero__media')).not.toBeNull();
  });

  it('draws the photograph once it is given one, with the alternative text as passed', () => {
    fixture.componentRef.setInput('image', { src: '/images/hero.webp', alt: 'Кухня Lio Mebli' });
    fixture.detectChanges();

    const image = host.querySelector('img');

    expect(image?.getAttribute('alt')).toBe('Кухня Lio Mebli');
    expect(image?.getAttribute('src')).toContain('/images/hero.webp');
  });

  it('darkens the photograph under the copy whether or not a photograph was given', () => {
    fixture.detectChanges();

    expect(host.querySelector('.hero__blob')).not.toBeNull();
    expect(host.querySelector('.hero__veil')).not.toBeNull();
  });

  it('keeps the photograph out of the copy, so nothing the visitor reads moves with it', () => {
    fixture.componentRef.setInput('image', { src: '/images/hero.webp', alt: 'Кухня Lio Mebli' });
    fixture.detectChanges();

    expect(host.querySelector('.hero__media img')).not.toBeNull();
    expect(host.querySelector('.hero__body .hero__image')).toBeNull();
  });

  it('sets the brand mark beside the heading, and hides it from anyone reading the name', () => {
    fixture.detectChanges();

    const mark = host.querySelector('.hero__mark');
    const lockup = host.querySelector('.hero__lockup');

    expect(mark?.getAttribute('src')).toBe('lm-mark.svg');
    expect(mark?.getAttribute('alt')).toBe('');
    expect(lockup?.contains(mark ?? null)).toBe(true);
    expect(lockup?.querySelector('h1')).not.toBeNull();
  });
});
