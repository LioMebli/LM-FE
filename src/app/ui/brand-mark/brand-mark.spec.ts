import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BrandMark } from './brand-mark';

describe('BrandMark', () => {
  let fixture: ComponentFixture<BrandMark>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandMark],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandMark);
  });

  it('sends the wordmark home, and names it for a reader who cannot see it', async () => {
    await fixture.whenStable();

    const brand = host().querySelector<HTMLAnchorElement>('.brand');

    expect(brand?.getAttribute('href')).toBe('/');
    expect(brand?.getAttribute('aria-label')).toBe('Lio Mebli — на головну');
  });

  it('leaves the mark out of the accessible name, so it is not announced twice', async () => {
    await fixture.whenStable();

    const mark = host().querySelector<HTMLImageElement>('.brand__mark');

    expect(mark?.getAttribute('alt')).toBe('');
    expect(host().querySelector('.brand__name')?.textContent?.trim()).toBe('Lio Mebli');
  });

  it('reserves the mark its own box, so the row does not reflow while it loads', async () => {
    await fixture.whenStable();

    const mark = host().querySelector<HTMLImageElement>('.brand__mark');

    expect(mark?.getAttribute('width')).toBe('33');
    expect(mark?.getAttribute('height')).toBe('48');
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
