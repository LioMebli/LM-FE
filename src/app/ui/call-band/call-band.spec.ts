import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallBand } from './call-band';

describe('CallBand', () => {
  let fixture: ComponentFixture<CallBand>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallBand],
    }).compileComponents();

    fixture = TestBed.createComponent(CallBand);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('heading', 'Один дзвінок — і ми порахуємо вашу кухню');
    fixture.componentRef.setInput('lede', 'Безкоштовна консультація.');
    fixture.componentRef.setInput('phone', '+380671234567');
  });

  it('places a call rather than leading somewhere on the page', () => {
    fixture.detectChanges();

    expect(host.querySelector('.band__call')?.getAttribute('href')).toBe('tel:+380671234567');
  });

  it('strips what a reader needs and a dialler does not', () => {
    fixture.componentRef.setInput('phone', '+38 (067) 123-45-67');
    fixture.detectChanges();

    expect(host.querySelector('.band__call')?.getAttribute('href')).toBe('tel:+380671234567');
    expect(host.querySelector('.band__phone')?.textContent?.trim()).toBe('+38 (067) 123-45-67');
  });

  it('prints the hours beside the number when it was given them', () => {
    fixture.componentRef.setInput('hours', 'Пн–Сб, 9:00–19:00');
    fixture.detectChanges();

    expect(host.querySelector('.band__hours')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Пн–Сб, 9:00–19:00 · +380671234567',
    );
  });

  it('leaves no separator behind when it was given no hours', () => {
    fixture.detectChanges();

    expect(host.querySelector('.band__hours')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '+380671234567',
    );
  });

  it('leaves the page’s only h1 to the hero and heads itself at the level below', () => {
    fixture.detectChanges();

    expect(host.querySelectorAll('h1')).toHaveLength(0);
    expect(host.querySelector('h2')?.textContent?.trim()).toBe(
      'Один дзвінок — і ми порахуємо вашу кухню',
    );
  });
});
