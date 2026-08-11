import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CategoryPage } from './category-page';
import { CategoryWithProducts } from './category-resolver';
import { AVAILABILITY_LABELS } from '../../core/api/catalog.types';
import { environment } from '../../../environments/environment';

describe('CategoryPage', () => {
  let fixture: ComponentFixture<CategoryPage>;
  let host: HTMLElement;
  let document: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryPage);
    host = fixture.nativeElement as HTMLElement;
    document = TestBed.inject(DOCUMENT);
  });

  it('lists the products in the order the catalog returned them', () => {
    render(category());

    expect(linkTexts()).toEqual(['Ручка-скоба РС-115', 'Ручка-кнопка РК-20']);
  });

  it('sends each product to its own page', () => {
    render(category());

    expect(linkHrefs()).toEqual(['/product/1042', '/product/7']);
  });

  it('leaves availability to the product page', () => {
    render(category());

    for (const label of Object.values(AVAILABILITY_LABELS)) {
      expect(host.textContent).not.toContain(label);
    }
  });

  it('says in Ukrainian that a category holds nothing yet', () => {
    render(category({ products: [] }));

    expect(host.textContent).toContain('У цьому розділі поки немає товарів.');
    expect(host.querySelector('ul')).toBeNull();
  });

  it('names itself in the title and points the canonical link at itself', () => {
    render(category());

    expect(document.title).toBe('Ручки меблеві — LioMebli');
    expect(canonical()).toBe(`${environment.siteOrigin}/category/1`);
  });

  it('describes itself with its own name', () => {
    render(category());

    expect(headContent('meta[name="description"]')).toBe(
      'Ручки меблеві — меблева фурнітура в каталозі LioMebli.',
    );
  });

  it('renders the not-found page for a category that does not exist', () => {
    render(null);

    expect(host.querySelector('h1')?.textContent).toContain('Сторінку не знайдено');
    expect(headContent('meta[name="robots"]')).toBe('noindex');
    expect(canonical()).toBe(`${environment.siteOrigin}/404`);
  });

  function render(value: CategoryWithProducts | null): void {
    fixture.componentRef.setInput('category', value);
    fixture.detectChanges();
  }

  function linkTexts(): string[] {
    return [...host.querySelectorAll('li a')].map((link) => link.textContent?.trim() ?? '');
  }

  function linkHrefs(): string[] {
    return [...host.querySelectorAll('li a')].map((link) => link.getAttribute('href') ?? '');
  }

  function canonical(): string | null {
    return headContent('link[rel="canonical"]', 'href');
  }

  function headContent(selector: string, attribute = 'content'): string | null {
    return document.head.querySelector(selector)?.getAttribute(attribute) ?? null;
  }

  function category(overrides: Partial<CategoryWithProducts> = {}): CategoryWithProducts {
    return {
      category: { id: 1, name: 'Ручки меблеві' },
      products: [
        { id: 1042, categoryId: 1, name: 'Ручка-скоба РС-115' },
        { id: 7, categoryId: 1, name: 'Ручка-кнопка РК-20' },
      ],
      ...overrides,
    };
  }
});
