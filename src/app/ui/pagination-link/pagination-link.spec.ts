import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PaginationLink } from './pagination-link';

describe('PaginationLink', () => {
  let fixture: ComponentFixture<PaginationLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationLink],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationLink);
    fixture.componentRef.setInput('label', '3');
    fixture.componentRef.setInput('link', '/category/1');
  });

  it('is a link while it is not the page being read', async () => {
    await fixture.whenStable();

    expect(host().querySelector('a')).not.toBeNull();
    expect(host().querySelector('[aria-current]')).toBeNull();
  });

  it('stops being a link on the current page, and says so to a screen reader', async () => {
    fixture.componentRef.setInput('current', true);
    await fixture.whenStable();

    expect(host().querySelector('a')).toBeNull();
    expect(host().querySelector('[aria-current]')?.getAttribute('aria-current')).toBe('page');
  });

  it('gives a word the room a digit does not need', async () => {
    fixture.componentRef.setInput('label', 'Далі');
    fixture.componentRef.setInput('kind', 'next');
    await fixture.whenStable();

    expect(host().querySelector('.page')?.classList.contains('page--next')).toBe(true);
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
