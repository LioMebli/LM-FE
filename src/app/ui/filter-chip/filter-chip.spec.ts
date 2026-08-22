import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterChip } from './filter-chip';

describe('FilterChip', () => {
  let fixture: ComponentFixture<FilterChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FilterChip] }).compileComponents();

    fixture = TestBed.createComponent(FilterChip);
    fixture.componentRef.setInput('label', 'Чорний');
  });

  it('names the filter in the remove control, so the control is not a bare ×', async () => {
    await fixture.whenStable();

    expect(removeControl()?.getAttribute('aria-label')).toBe('Прибрати фільтр: Чорний');
  });

  it('prefers the spoken form when the visible label does not read aloud', async () => {
    fixture.componentRef.setInput('label', '800–5 000 ₴');
    fixture.componentRef.setInput('spokenAs', 'ціна від 800 до 5 000 гривень');
    await fixture.whenStable();

    expect(removeControl()?.getAttribute('aria-label')).toBe(
      'Прибрати фільтр: ціна від 800 до 5 000 гривень',
    );
    expect((fixture.nativeElement as HTMLElement).querySelector('.chip__text')?.textContent).toBe(
      '800–5 000 ₴',
    );
  });

  it('reports the removal rather than removing itself', async () => {
    let removals = 0;

    fixture.componentInstance.removed.subscribe(() => (removals += 1));
    await fixture.whenStable();

    removeControl()?.click();

    expect(removals).toBe(1);
    expect((fixture.nativeElement as HTMLElement).querySelector('.chip')).not.toBeNull();
  });

  function removeControl(): HTMLButtonElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.chip__remove');
  }
});
