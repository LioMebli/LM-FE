import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionButton } from './action-button';

describe('ActionButton', () => {
  let fixture: ComponentFixture<ActionButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActionButton] }).compileComponents();

    fixture = TestBed.createComponent(ActionButton);
  });

  it('stays out of a form until a caller asks it in', async () => {
    await fixture.whenStable();

    expect(button()?.type).toBe('button');
  });

  it('submits when the caller asks it to', async () => {
    fixture.componentRef.setInput('type', 'submit');
    await fixture.whenStable();

    expect(button()?.type).toBe('submit');
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

  function button(): HTMLButtonElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.button');
  }
});
