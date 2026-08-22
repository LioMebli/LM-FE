import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxRow } from './checkbox-row';

describe('CheckboxRow', () => {
  let fixture: ComponentFixture<CheckboxRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CheckboxRow] }).compileComponents();

    fixture = TestBed.createComponent(CheckboxRow);
    fixture.componentRef.setInput('label', 'Граніт');
  });

  it('labels the box, so the whole row is the tap target and not just the square', async () => {
    await fixture.whenStable();

    const row = (fixture.nativeElement as HTMLElement).querySelector('label');

    expect(row?.querySelector('input')).not.toBeNull();
    expect(row?.textContent?.trim()).toBe('Граніт');
  });

  it('starts unchecked and reports the change outward', async () => {
    await fixture.whenStable();

    expect(fixture.componentInstance.checked()).toBe(false);

    box().click();
    await fixture.whenStable();

    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it('follows a value set from outside', async () => {
    fixture.componentRef.setInput('checked', true);
    await fixture.whenStable();

    expect(box().checked).toBe(true);
  });

  function box(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input')!;
  }
});
