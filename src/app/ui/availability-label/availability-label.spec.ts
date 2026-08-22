import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityLabel } from './availability-label';
import { Availability } from '../../core/api/catalog.types';

describe('AvailabilityLabel', () => {
  let fixture: ComponentFixture<AvailabilityLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AvailabilityLabel] }).compileComponents();

    fixture = TestBed.createComponent(AvailabilityLabel);
  });

  it.each([
    ['IN_STOCK', 'В наявності', 'label--in-stock'],
    ['MADE_TO_ORDER', 'Під замовлення', 'label--made-to-order'],
    ['DISCONTINUED', 'Знято з виробництва', 'label--discontinued'],
  ] as [Availability, string, string][])('states %s as "%s"', async (state, text, className) => {
    fixture.componentRef.setInput('availability', state);
    await fixture.whenStable();

    const label = (fixture.nativeElement as HTMLElement).querySelector('.label');

    expect(label?.textContent?.trim()).toBe(text);
    expect(label?.classList.contains(className)).toBe(true);
  });

  it('carries exactly one state class, so the three lightnesses cannot stack', async () => {
    fixture.componentRef.setInput('availability', 'MADE_TO_ORDER');
    await fixture.whenStable();

    const classes = [
      ...((fixture.nativeElement as HTMLElement).querySelector('.label')?.classList ?? []),
    ];

    expect(classes.filter((name) => name.startsWith('label--'))).toEqual(['label--made-to-order']);
  });
});
