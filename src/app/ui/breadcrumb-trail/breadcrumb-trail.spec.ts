import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BreadcrumbTrail } from './breadcrumb-trail';

describe('BreadcrumbTrail', () => {
  let fixture: ComponentFixture<BreadcrumbTrail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbTrail],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbTrail);
    fixture.componentRef.setInput('steps', [
      { label: 'Каталог', link: '/' },
      { label: 'Меблеві комплектуючі', link: '/category/1' },
      { label: 'Кухонні комплектуючі' },
    ]);
  });

  it('links every step above the one being read', async () => {
    await fixture.whenStable();

    expect(host().querySelectorAll('a')).toHaveLength(2);
  });

  it('leaves the last step unlinked and marks it as the current page', async () => {
    await fixture.whenStable();

    const current = host().querySelector('[aria-current="page"]');

    expect(current?.tagName).toBe('SPAN');
    expect(current?.textContent?.trim()).toBe('Кухонні комплектуючі');
  });

  it('names the navigation, so a screen reader can tell it from the rest', async () => {
    await fixture.whenStable();

    expect(host().querySelector('nav')?.getAttribute('aria-label')).toBe('Навігація розділами');
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
