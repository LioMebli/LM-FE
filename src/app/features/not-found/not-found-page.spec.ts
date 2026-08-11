import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  let host: HTMLElement;
  let document: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    host = fixture.nativeElement as HTMLElement;
    document = TestBed.inject(DOCUMENT);
  });

  it('explains what happened, in Ukrainian', () => {
    expect(host.querySelector('h1')?.textContent).toContain('Сторінку не знайдено');
    expect(host.textContent).toContain(
      'Можливо, товар знято з продажу або адресу введено з помилкою.',
    );
  });

  it('offers a way back to the catalog', () => {
    const link = host.querySelector('a');

    expect(link?.textContent).toContain('Перейти до каталогу');
    expect(link?.getAttribute('href')).toBe('/');
  });

  it('keeps itself out of the index', () => {
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex',
    );
  });
});
