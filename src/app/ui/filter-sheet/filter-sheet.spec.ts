import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSheet } from './filter-sheet';

function giveJsdomTheDialogMethods(): void {
  const dialog = HTMLDialogElement.prototype as HTMLDialogElement;

  dialog.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };

  dialog.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

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
    ['.sheet__close', 'Закрити'],
    ['.sheet__apply', 'Показати 128 товарів'],
  ])('closes by %s, which carries the label "%s"', async (selector, label) => {
    await fixture.whenStable();
    fixture.componentInstance.open();

    const control = host().querySelector<HTMLButtonElement>(selector)!;

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

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function sheet(): HTMLDialogElement {
    return host().querySelector('dialog')!;
  }
});
