import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { StickyActionBar } from './sticky-action-bar';

describe('StickyActionBar', () => {
  let fixture: ComponentFixture<StickyActionBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyActionBar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StickyActionBar);
    fixture.componentRef.setInput('selectionCount', 3);
    fixture.componentRef.setInput('selectionLink', '/');
    fixture.componentRef.setInput('phone', '+380671234567');
  });

  it('dials from the device the visitor is browsing on', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.bar__call')?.getAttribute('href')).toBe('tel:+380671234567');
  });

  it('counts the selection beside the call, so the count has somewhere to lead', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.bar__count')?.textContent?.trim()).toBe('3');
  });

  it('shows the bar with an empty selection too — it is never absent', async () => {
    fixture.componentRef.setInput('selectionCount', 0);
    await fixture.whenStable();

    expect(host().querySelector('.bar')).not.toBeNull();
    expect(host().querySelector('.bar__count')?.textContent?.trim()).toBe('0');
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
