import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CatalogPage } from './catalog-page';
import { CategoryResponse } from '../../core/api/catalog.types';
import { environment } from '../../../environments/environment';

describe('CatalogPage', () => {
  let fixture: ComponentFixture<CatalogPage>;
  let host: HTMLElement;
  let document: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPage);
    host = fixture.nativeElement as HTMLElement;
    document = TestBed.inject(DOCUMENT);
  });

  it('lists every category in the order the catalog returned them', () => {
    render(categories());

    expect(linkTexts()).toEqual(['Ручки меблеві', 'Петлі', 'Напрямні']);
  });

  it('sends each category to its own page', () => {
    render(categories());

    expect(linkHrefs()).toEqual(['/category/1', '/category/2', '/category/3']);
  });

  it('lists a category that currently holds no products', () => {
    render(categories());

    expect(linkTexts()).toContain('Напрямні');
  });

  it('names the catalog in the title and points the canonical link at the root', () => {
    render(categories());

    expect(document.title).toBe('Каталог — LioMebli');
    expect(canonical()).toBe(`${environment.siteOrigin}/`);
  });

  function render(value: CategoryResponse[]): void {
    fixture.componentRef.setInput('categories', value);
    fixture.detectChanges();
  }

  function linkTexts(): string[] {
    return [...host.querySelectorAll('li a')].map((link) => link.textContent?.trim() ?? '');
  }

  function linkHrefs(): string[] {
    return [...host.querySelectorAll('li a')].map((link) => link.getAttribute('href') ?? '');
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
