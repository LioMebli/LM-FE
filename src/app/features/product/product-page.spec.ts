import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductPage } from './product-page';
import { Availability, ProductDetail } from '../../core/api/catalog.types';
import { environment } from '../../../environments/environment';

describe('ProductPage', () => {
  let fixture: ComponentFixture<ProductPage>;
  let host: HTMLElement;
  let document: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPage);
    host = fixture.nativeElement as HTMLElement;
    document = TestBed.inject(DOCUMENT);
  });

  it.each([
    ['IN_STOCK', 'В наявності'],
    ['MADE_TO_ORDER', 'Під замовлення'],
    ['DISCONTINUED', 'Знято з виробництва'],
  ] as [Availability, string][])('says in Ukrainian that %s means %s', (availability, label) => {
    render(product({ availability }));

    expect(host.querySelector('.availability')?.textContent).toContain(label);
  });

  it('shows the name and both descriptive texts', () => {
    render(
      product({ shortDescription: 'Коротко про ручку', description: 'Повний опис ручки-скоби.' }),
    );

    expect(host.querySelector('h1')?.textContent).toContain('Ручка-скоба РС-115');
    expect(host.querySelector('.lead')?.textContent).toContain('Коротко про ручку');
    expect(host.textContent).toContain('Повний опис ручки-скоби.');
  });

  it('leaves nothing behind where a product has no descriptive text', () => {
    render(product());

    expect(host.querySelector('h1')?.textContent).toContain('Ручка-скоба РС-115');
    expect(host.querySelector('.lead')).toBeNull();
    expect(host.querySelectorAll('p').length).toBe(1);
    expect(host.querySelector('p')?.textContent).toContain('В наявності');
  });

  it('names itself in the title and points the canonical link at itself', () => {
    render(product());

    expect(document.title).toBe('Ручка-скоба РС-115 — LioMebli');
    expect(canonical()).toBe(`${environment.siteOrigin}/product/1042`);
  });

  it('describes itself with the short description when it has one', () => {
    render(product({ shortDescription: 'Коротко про ручку', description: 'Повний опис.' }));

    expect(headContent('meta[name="description"]')).toBe('Коротко про ручку');
  });

  it('cuts a long description back to a whole word', () => {
    render(product({ description: `${'слово '.repeat(30)}хвіст` }));

    const description = headContent('meta[name="description"]') ?? '';

    expect(description.length).toBeLessThanOrEqual(160);
    expect(description.endsWith('слово')).toBe(true);
  });

  it('describes itself not at all when the catalog holds no text', () => {
    render(product());

    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });

  it('follows the visitor from one product to the next', () => {
    render(product());
    render(product({ id: 7, name: 'Петля піано 1200 мм' }));

    expect(document.title).toBe('Петля піано 1200 мм — LioMebli');
    expect(canonical()).toBe(`${environment.siteOrigin}/product/7`);
  });

  it('renders the not-found page for a product that does not exist', () => {
    render(null);

    expect(host.textContent).toContain('Сторінку не знайдено');
    expect(host.querySelector('h1')?.textContent).toContain('Сторінку не знайдено');
    expect(headContent('meta[name="robots"]')).toBe('noindex');
    expect(canonical()).toBe(`${environment.siteOrigin}/404`);
  });

  function render(value: ProductDetail | null): void {
    fixture.componentRef.setInput('product', value);
    fixture.detectChanges();
  }

  function canonical(): string | null {
    return headContent('link[rel="canonical"]', 'href');
  }

  function headContent(selector: string, attribute = 'content'): string | null {
    return document.head.querySelector(selector)?.getAttribute(attribute) ?? null;
  }

  function product(overrides: Partial<ProductDetail> = {}): ProductDetail {
    return {
      id: 1042,
      categoryId: 1,
      name: 'Ручка-скоба РС-115',
      shortDescription: null,
      description: null,
      availability: 'IN_STOCK',
      ...overrides,
    };
  }
});
