import { ComponentFixture, TestBed } from '@angular/core/testing';

import { giveJsdomTheDialogMethods } from '../../../testing/dialog';
import { FilterSheet } from './filter-sheet';

describe('FilterSheet', () => {
  let fixture: ComponentFixture<FilterSheet>;

  beforeAll(giveJsdomTheDialogMethods);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FilterSheet] }).compileComponents();

    fixture = TestBed.createComponent(FilterSheet);
    fixture.componentRef.setInput('applyLabel', 'Показати 128 товарів');
  });

  it('starts closed, showing only the control that opens it', async () => {
    await fixture.whenStable();

    expect(sheet().open).toBe(false);
    expect(host().querySelector('.opener')).not.toBeNull();
  });

  it('opens as a modal, so the page behind it cannot take focus', async () => {
    await fixture.whenStable();

    host().querySelector<HTMLButtonElement>('.opener')!.click();

    expect(sheet().open).toBe(true);
  });

  it.each([
    ['.sheet__head', 'Закрити'],
    ['.sheet__foot', 'Показати 128 товарів'],
  ])('closes by the control in %s, which carries the label "%s"', async (slot, label) => {
    await fixture.whenStable();
    fixture.componentInstance.open();

    const control = host().querySelector<HTMLButtonElement>(`${slot} app-action-button button`)!;

    expect(control.textContent?.trim()).toBe(label);

    control.click();

    expect(sheet().open).toBe(false);
  });

  it('counts the applied filters on the opener, and hides a zero', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.opener__count')).toBeNull();

    fixture.componentRef.setInput('activeCount', 4);
    await fixture.whenStable();

    expect(host().querySelector('.opener__count')?.textContent?.trim()).toBe('4');
  });

  it('names itself for a screen reader without minting an id that could collide', async () => {
    await fixture.whenStable();

    expect(sheet().getAttribute('aria-label')).toBe('Фільтри');
    expect(sheet().getAttribute('aria-labelledby')).toBeNull();
  });

  it('is a dialog while it is a drawer: no role of its own, and no open attribute', async () => {
    await fixture.whenStable();

    expect(sheet().getAttribute('role')).toBeNull();
    expect(sheet().hasAttribute('open')).toBe(false);
  });

  it('stops being a dialog once the stylesheet says it stands in the page', async () => {
    await fixture.whenStable();

    widen();
    await fixture.whenStable();

    expect(sheet().getAttribute('role')).toBe('group');
    expect(sheet().hasAttribute('open')).toBe(true);
  });

  it('reads the state from the stylesheet, so no width is written in the component', async () => {
    await fixture.whenStable();

    widen();
    await fixture.whenStable();
    expect(sheet().getAttribute('role')).toBe('group');

    host().style.setProperty('--lm-sheet-inflow', '0');
    window.dispatchEvent(new Event('resize'));
    await fixture.whenStable();

    expect(sheet().getAttribute('role')).toBeNull();
    expect(sheet().hasAttribute('open')).toBe(false);
  });

  function widen(): void {
    host().style.setProperty('--lm-sheet-inflow', '1');
    window.dispatchEvent(new Event('resize'));
  }

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function sheet(): HTMLDialogElement {
    return host().querySelector('dialog')!;
  }
});
