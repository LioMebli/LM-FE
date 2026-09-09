import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessStep, ProcessSteps } from './process-steps';

const STEPS: ProcessStep[] = [
  { label: 'Оберіть потрібне', detail: 'Знайдіть у каталозі й додайте до підбірки.' },
  { label: 'Отримайте код', detail: 'Підбірка отримує короткий код.' },
  { label: 'Зателефонуйте', detail: 'Назвіть код — менеджер відкриє вашу підбірку.' },
];

describe('ProcessSteps', () => {
  let fixture: ComponentFixture<ProcessSteps>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessSteps],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessSteps);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('steps', STEPS);
  });

  it('numbers the steps from their position, so a reorder renumbers them', () => {
    fixture.detectChanges();

    expect(ordinals()).toEqual(['1', '2', '3']);

    fixture.componentRef.setInput('steps', [STEPS[2], STEPS[0], STEPS[1]]);
    fixture.detectChanges();

    expect(ordinals()).toEqual(['1', '2', '3']);
    expect(labels()[0]).toBe('Зателефонуйте');
  });

  it('renumbers rather than reusing a number when a step is removed', () => {
    fixture.componentRef.setInput('steps', STEPS.slice(0, 2));
    fixture.detectChanges();

    expect(ordinals()).toEqual(['1', '2']);
  });

  it('keeps the list role that list-style:none takes away, so the order is not only visual', () => {
    fixture.detectChanges();

    expect(host.querySelector('ol')?.getAttribute('role')).toBe('list');
    expect(host.querySelectorAll('ol > li')).toHaveLength(3);
  });

  it('renders each detail whole, because a clamped line hides the copy problem', () => {
    fixture.detectChanges();

    expect(details()).toEqual(STEPS.map((step) => step.detail));
  });

  function ordinals(): string[] {
    return [...host.querySelectorAll('.step__ordinal')].map((e) => e.textContent?.trim() ?? '');
  }

  function labels(): string[] {
    return [...host.querySelectorAll('.step__label')].map((e) => e.textContent?.trim() ?? '');
  }

  function details(): string[] {
    return [...host.querySelectorAll('.step__detail')].map((e) => e.textContent?.trim() ?? '');
  }
});
