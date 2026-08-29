import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextField } from './text-field';

describe('TextField', () => {
  let fixture: ComponentFixture<TextField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextField] }).compileComponents();

    fixture = TestBed.createComponent(TextField);
    fixture.componentRef.setInput('label', 'Ціна від, ₴');
  });

  it('puts the input inside its label, so the two are associated rather than adjacent', async () => {
    await fixture.whenStable();

    const label = host().querySelector<HTMLLabelElement>('.field__label');

    expect(label?.querySelector('input')).toBe(input());
    expect(label?.querySelector('.field__caption')?.textContent?.trim()).toBe('Ціна від, ₴');
  });

  it('keeps the message out of the label, so an error never becomes part of the field name', async () => {
    fixture.componentRef.setInput('error', 'Вкажіть число');
    await fixture.whenStable();

    const label = host().querySelector<HTMLLabelElement>('.field__label');

    expect(label?.querySelector('.field__message')).toBeNull();
    expect(label?.textContent?.trim()).toBe('Ціна від, ₴');
  });

  it('makes the message the input description and marks the input invalid', async () => {
    fixture.componentRef.setInput('error', 'Вкажіть число');
    await fixture.whenStable();

    const message = host().querySelector<HTMLElement>('.field__message')!;

    expect(message.textContent?.trim()).toBe('Вкажіть число');
    expect(input().getAttribute('aria-describedby')).toBe(message.id);
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('marks nothing and describes nothing when there is no error', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.field__message')?.textContent?.trim()).toBe('');
    expect(input().getAttribute('aria-describedby')).toBeNull();
    expect(input().getAttribute('aria-invalid')).toBeNull();
  });

  it('keeps the message box in both states, so an error does not move the layout', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.field__message')).not.toBeNull();

    fixture.componentRef.setInput('error', 'Вкажіть число');
    await fixture.whenStable();

    expect(host().querySelectorAll('.field__message').length).toBe(1);
  });

  it('reports what was typed rather than deciding anything about it', async () => {
    const typed: string[] = [];

    fixture.componentInstance.valueChanged.subscribe((v) => typed.push(v));
    await fixture.whenStable();

    input().value = '800';
    input().dispatchEvent(new Event('input'));

    expect(typed).toEqual(['800']);
  });

  it('asks for a text keyboard by default and a numeric one when told', async () => {
    await fixture.whenStable();

    expect(input().getAttribute('inputmode')).toBe('text');

    fixture.componentRef.setInput('inputmode', 'numeric');
    await fixture.whenStable();

    expect(input().getAttribute('inputmode')).toBe('numeric');
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function input(): HTMLInputElement {
    return host().querySelector<HTMLInputElement>('.field__input')!;
  }
});
