import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionButton } from './action-button';

@Component({
  imports: [ActionButton],
  template: '<app-action-button><span class="label">Переглянути каталог</span></app-action-button>',
})
class CallerWithALabel {}

describe('ActionButton', () => {
  let fixture: ComponentFixture<ActionButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActionButton] }).compileComponents();

    fixture = TestBed.createComponent(ActionButton);
  });

  it('stays out of a form, so a caller cannot submit one by accident', async () => {
    await fixture.whenStable();

    expect(button()?.type).toBe('button');
  });

  it('is the quieter of the two variants unless told otherwise', async () => {
    await fixture.whenStable();

    expect(button()?.classList.contains('button--primary')).toBe(false);
  });

  it('carries the primary variant as a class rather than as its own element', async () => {
    fixture.componentRef.setInput('variant', 'primary');
    await fixture.whenStable();

    expect(button()?.classList.contains('button--primary')).toBe(true);
    expect(button()?.tagName).toBe('BUTTON');
  });

  it('reports the press rather than acting on it', async () => {
    let presses = 0;

    fixture.componentInstance.pressed.subscribe(() => (presses += 1));
    await fixture.whenStable();

    button()?.click();

    expect(presses).toBe(1);
  });

  it('announces a dialog only when it opens one', async () => {
    await fixture.whenStable();

    expect(button()?.hasAttribute('aria-haspopup')).toBe(false);

    fixture.componentRef.setInput('opens', 'dialog');
    await fixture.whenStable();

    expect(button()?.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('takes its label from the caller, inside the control rather than beside it', async () => {
    const caller = TestBed.createComponent(CallerWithALabel);
    await caller.whenStable();

    const label = (caller.nativeElement as HTMLElement).querySelector('.label');

    expect(label?.closest('button')).not.toBeNull();
  });

  function button(): HTMLButtonElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.button');
  }
});
