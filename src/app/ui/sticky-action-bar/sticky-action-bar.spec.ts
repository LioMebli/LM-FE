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

  it('carries the call alone on a page that has no selection yet', async () => {
    fixture.componentRef.setInput('selectionCount', undefined);
    fixture.componentRef.setInput('selectionLink', undefined);
    await fixture.whenStable();

    expect(host().querySelector('.bar__call')).not.toBeNull();
    expect(host().querySelector('.bar__selection')).toBeNull();
  });

  it('reads a count with no destination as no selection, not as a link to nowhere', async () => {
    fixture.componentRef.setInput('selectionLink', undefined);
    await fixture.whenStable();

    expect(host().querySelector('.bar__selection')).toBeNull();
    expect(host().querySelector('.bar__call')).not.toBeNull();
  });

  it('reads a destination with no count the same way', async () => {
    fixture.componentRef.setInput('selectionCount', undefined);
    await fixture.whenStable();

    expect(host().querySelector('.bar__selection')).toBeNull();
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
