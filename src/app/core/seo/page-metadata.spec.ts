import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PageMetadata } from './page-metadata';
import { environment } from '../../../environments/environment';

describe('PageMetadata', () => {
  let metadata: PageMetadata;
  let document: Document;

  beforeEach(() => {
    metadata = TestBed.inject(PageMetadata);
    document = TestBed.inject(DOCUMENT);
  });

  it('sets the title', () => {
    metadata.apply({ title: 'Каталог', path: '/' });

    expect(document.title).toBe('Каталог — LioMebli');
  });

  it('sets the description when the page has one', () => {
    metadata.apply({ title: 'Товар', path: '/product/1042', description: 'Опис товару' });

    expect(content('meta[name="description"]')).toBe('Опис товару');
  });

  it('leaves no description in the document when the page has none', () => {
    metadata.apply({ title: 'Товар', path: '/product/1042', description: 'Опис товару' });
    metadata.apply({ title: 'Інший товар', path: '/product/7' });

    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
  });

  it('updates the canonical link rather than adding a second one', () => {
    metadata.apply({ title: 'Каталог', path: '/' });
    metadata.apply({ title: 'Розділ', path: '/category/1' });

    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(content('link[rel="canonical"]', 'href')).toBe(`${environment.siteOrigin}/category/1`);
  });

  it('marks the page noindex only when asked', () => {
    metadata.apply({ title: 'Сторінку не знайдено', path: '/404', noindex: true });
    expect(content('meta[name="robots"]')).toBe('noindex');

    metadata.apply({ title: 'Каталог', path: '/' });
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  function content(selector: string, attribute = 'content'): string | null {
    return document.head.querySelector(selector)?.getAttribute(attribute) ?? null;
  }
});
