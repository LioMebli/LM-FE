import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantBadge } from './variant-badge';

describe('VariantBadge', () => {
  let fixture: ComponentFixture<VariantBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VariantBadge] }).compileComponents();

    fixture = TestBed.createComponent(VariantBadge);
  });

  it('names the count in the short form the photograph has room for', async () => {
    fixture.componentRef.setInput('count', 12);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('Варіантів: 12');
  });
});
