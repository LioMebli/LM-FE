import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBanner } from './hero-banner';

describe('HeroBanner', () => {
  let fixture: ComponentFixture<HeroBanner>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBanner);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('heading', 'Меблева фурнітура');
    fixture.componentRef.setInput('lede', 'Ручки, петлі, напрямні та комплектуючі.');
  });

  it('opens the page with the heading as its only h1', () => {
    fixture.detectChanges();

    expect(host.querySelectorAll('h1')).toHaveLength(1);
    expect(host.querySelector('h1')?.textContent?.trim()).toBe('Меблева фурнітура');
  });

  it('draws no photograph while there is none, rather than an image with no source', () => {
    fixture.detectChanges();

    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.hero__media')).not.toBeNull();
  });

  it('draws the photograph once it is given one, with the alternative text as passed', () => {
    fixture.componentRef.setInput('image', { src: '/media/hero.webp', alt: 'Ручки на верстаті' });
    fixture.detectChanges();

    const image = host.querySelector('img');

    expect(image?.getAttribute('alt')).toBe('Ручки на верстаті');
    expect(image?.getAttribute('src')).toContain('/media/hero.webp');
  });

  it('puts the photograph in the media layer and never in the body, so nothing below it moves', () => {
    fixture.componentRef.setInput('image', { src: '/media/hero.webp', alt: 'Ручки на верстаті' });
    fixture.detectChanges();

    expect(host.querySelector('.hero__media img')).not.toBeNull();
    expect(host.querySelector('.hero__body img')).toBeNull();
  });
});
