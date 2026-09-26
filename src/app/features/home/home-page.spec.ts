import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomePage } from './home-page';
import { environment } from '../../../environments/environment';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let host: HTMLElement;
  let document: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    host = fixture.nativeElement as HTMLElement;
    document = TestBed.inject(DOCUMENT);
    fixture.detectChanges();
  });

  it('renders the hero outside any section, because it is the one full-bleed block', () => {
    const unwrapped = [...host.querySelectorAll('[class*="home__"], app-hero-panel')]
      .map((node) => node.tagName.toLowerCase())
      .filter((tag) => tag.startsWith('app-'));

    expect(unwrapped).toEqual(['app-hero-panel']);
  });

  it('carries every block the drawn page is made of, in the order it draws them', () => {
    expect(order()).toEqual([
      'app-hero-panel',
      'app-service-row',
      'app-call-band',
      'app-project-card',
      'app-project-card',
      'app-material-picker',
      'app-process-steps',
      'app-testimonial-carousel',
      'app-review-form',
    ]);
  });

  it('gives every section a component to draw it, rather than markup of its own', () => {
    const sections = [...host.querySelectorAll(':scope > section')];
    const drawnBySomething = sections.filter((section) =>
      [...section.querySelectorAll('*')].some((node) => node.tagName.startsWith('APP-')),
    );

    expect(sections.length).toBeGreaterThan(0);
    expect(drawnBySomething).toHaveLength(sections.length);
  });

  it('leaves the sticky call bar to the catalog, where a selection exists to carry', () => {
    expect(host.querySelector('app-sticky-action-bar')).toBeNull();
  });

  it('offers the way into the catalog the drawing draws, and sends it where the drawing does', () => {
    const control = host.querySelector<HTMLAnchorElement>('.home__catalog')!;

    expect(control.textContent?.trim()).toBe('Переглянути весь каталог');
    expect(control.getAttribute('href')).toBe('/#foot');
  });

  it('opens the outline with one h1 and heads every section at the level below', () => {
    expect(host.querySelectorAll('h1')).toHaveLength(1);
    expect(host.querySelector('h1')?.textContent?.trim()).toBe('Lio Mebli');
    expect(host.querySelectorAll('h2').length).toBeGreaterThanOrEqual(4);
  });

  it('descends the outline one level at a time, so no section is reached by a jump', () => {
    const levels = [...host.querySelectorAll('h1, h2, h3, h4')].map((h) => Number(h.tagName[1]));
    const skips = levels.filter((level, i) => i > 0 && level - levels[i - 1] > 1);

    expect(levels[0]).toBe(1);
    expect(skips).toEqual([]);
  });

  it('heads the services with a heading the page does not draw but a reader still hears', () => {
    const heading = host.querySelector('.home__services h2');

    expect(heading?.textContent?.trim()).toBe('Що ми робимо');
    expect(heading?.className).toContain('visually-hidden');
    expect(host.querySelector('.home__services')?.getAttribute('aria-labelledby')).toBe(
      heading?.id,
    );
  });

  it('names the business in the title and points the canonical link at the root', () => {
    expect(document.title).toBe('Меблі на замовлення — LioMebli');
    expect(canonical()).toBe(`${environment.siteOrigin}/`);
  });

  it('says what the page is in the title rather than the brand twice', () => {
    const brandMentions = document.title.split(/Lio\s*Mebli/i).length - 1;

    expect(brandMentions).toBe(1);
    expect(document.title).not.toContain(host.querySelector('h1')?.textContent?.trim());
  });

  it('addresses the visitor as «ви» and never as «ти»', () => {
    const copy = host.textContent ?? '';

    expect(copy).toContain('зручно вам');
    expect(copy).toContain('ваш простір');
    expect(copy).toContain('ваших ідеальних меблів');
    expect(copy).not.toMatch(/\sтобі\s|\sтвої|\sтвоїх|\sзручно тобі/i);
  });

  it('gives the hero a photograph that the browser is told to fetch first', () => {
    const image = host.querySelector('app-hero-panel img');

    expect(image?.getAttribute('src')).toContain('images/hero-kitchen.webp');
    expect(image?.getAttribute('fetchpriority')).toBe('high');
  });

  function order(): string[] {
    const wanted = new Set([
      'app-hero-panel',
      'app-service-row',
      'app-call-band',
      'app-project-card',
      'app-material-picker',
      'app-process-steps',
      'app-testimonial-carousel',
      'app-review-form',
    ]);

    return [...host.querySelectorAll('*')]
      .map((node) => node.tagName.toLowerCase())
      .filter((tag) => wanted.has(tag));
  }

  function canonical(): string | null {
    return document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
  }
});
