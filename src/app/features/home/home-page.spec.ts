import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomePage } from './home-page';
import { CategoryResponse } from '../../core/api/catalog.types';
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
  });

  it('lists every category in the order the catalog returned them', () => {
    render(categories());

    expect(cardTexts()).toEqual(['Ручки меблеві', 'Петлі', 'Напрямні']);
  });

  it('sends each category to its own page', () => {
    render(categories());

    expect(cardHrefs()).toEqual(['/category/1', '/category/2', '/category/3']);
  });

  it('drops the whole block when the catalog returns nothing, rather than drawing an empty one', () => {
    render([]);

    expect(host.querySelector('.home__categories')).toBeNull();
  });

  it('still says what is sold when the catalog returns nothing', () => {
    render([]);

    expect(host.querySelector('app-hero-banner h1')?.textContent).toContain('Меблева фурнітура');
  });

  it('names what is sold in the title and points the canonical link at the root', () => {
    render(categories());

    expect(document.title).toBe('Меблева фурнітура — LioMebli');
    expect(canonical()).toBe(`${environment.siteOrigin}/`);
  });

  it('says how buying works, because a shop with no cart cannot leave that to guesswork', () => {
    render(categories());

    const steps = host.querySelector('app-process-steps');

    expect(steps?.querySelectorAll('ol > li')).toHaveLength(3);
    expect(host.querySelector('.home__process h2')?.textContent?.trim()).toBe(
      'Як зробити замовлення',
    );
  });

  it('keeps the steps as the last content, so the block that must clear the bar is the one measured', () => {
    render(categories());

    const blocks = [...host.querySelectorAll('section')];

    expect(blocks.at(-1)?.classList.contains('home__process')).toBe(true);
  });

  it('carries a call that survives scrolling, with no selection to lead nowhere', () => {
    render(categories());

    const bar = host.querySelector('app-sticky-action-bar');

    expect(bar?.querySelector('.bar__call')?.getAttribute('href')).toMatch(/^tel:\+/);
    expect(bar?.querySelector('.bar__selection')).toBeNull();
  });

  it('opens the document outline with one h1 and puts the categories under an h2', () => {
    render(categories());

    expect(host.querySelectorAll('h1')).toHaveLength(1);
    expect(host.querySelector('h2')?.textContent?.trim()).toBe('Категорії');
  });

  function render(value: CategoryResponse[]): void {
    fixture.componentRef.setInput('categories', value);
    fixture.detectChanges();
  }

  function cardTexts(): string[] {
    return [...host.querySelectorAll('app-category-card')].map(
      (card) => card.textContent?.trim() ?? '',
    );
  }

  function cardHrefs(): string[] {
    return [...host.querySelectorAll('app-category-card a')].map(
      (link) => link.getAttribute('href') ?? '',
    );
  }

  function canonical(): string | null {
    return document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
  }

  function categories(): CategoryResponse[] {
    return [
      { id: 1, name: 'Ручки меблеві' },
      { id: 2, name: 'Петлі' },
      { id: 3, name: 'Напрямні' },
    ];
  }
});
