import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceRow } from './service-row';

describe('ServiceRow', () => {
  let fixture: ComponentFixture<ServiceRow>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceRow],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceRow);
    host = fixture.nativeElement as HTMLElement;
  });

  it('names every service in the order it was given', () => {
    fixture.componentRef.setInput('services', [
      { name: 'Проєктування', detail: 'Індивідуальні рішення під ваш простір.' },
      { name: 'Виготовлення', detail: 'Чесні матеріали й власне виробництво.' },
      { name: 'Монтаж', detail: 'Привозимо, збираємо, прибираємо за собою.' },
    ]);
    fixture.detectChanges();

    const names = [...host.querySelectorAll('.service__name')].map((node) =>
      node.textContent?.trim(),
    );

    expect(names).toEqual(['Проєктування', 'Виготовлення', 'Монтаж']);
  });

  it('puts each service under a heading of its own, never under the page’s only h1', () => {
    fixture.componentRef.setInput('services', [{ name: 'Монтаж', detail: 'Привозимо й збираємо.' }]);
    fixture.detectChanges();

    expect(host.querySelectorAll('h1')).toHaveLength(0);
    expect(host.querySelectorAll('h3')).toHaveLength(1);
  });

  it('renders no service at all when the list is empty, rather than an empty row', () => {
    fixture.componentRef.setInput('services', []);
    fixture.detectChanges();

    expect(host.querySelectorAll('.service')).toHaveLength(0);
  });

  it('draws a single service as one item rather than stretching it across the row', () => {
    fixture.componentRef.setInput('services', [
      { name: 'Проєктування', detail: 'Індивідуальні рішення.' },
    ]);
    fixture.detectChanges();

    expect(host.querySelectorAll('.service')).toHaveLength(1);
    expect(host.querySelector('.service__detail')?.textContent?.trim()).toBe(
      'Індивідуальні рішення.',
    );
  });
});
