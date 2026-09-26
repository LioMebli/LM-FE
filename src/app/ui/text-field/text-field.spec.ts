import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';

import { TextField } from './text-field';

@Component({
  selector: 'app-prefilled-field-host',
  imports: [FormField, TextField],
  template: '<app-text-field label="Імʼя" [formField]="held.name" />',
})
class PrefilledFieldHost {
  readonly model = signal({ name: 'Олена' });

  readonly held = form(this.model);
}

@Component({
  selector: 'app-empty-field-host',
  imports: [FormField, TextField],
  template: '<app-text-field label="Імʼя" [formField]="held.name" />',
})
class EmptyFieldHost {
  readonly model = signal({ name: '' });

  readonly held = form(this.model);
}

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

  it('renders the message element in both states, never adding or removing one', async () => {
    await fixture.whenStable();

    expect(host().querySelectorAll('.field__message').length).toBe(1);

    fixture.componentRef.setInput('error', 'Вкажіть число');
    await fixture.whenStable();

    expect(host().querySelectorAll('.field__message').length).toBe(1);
  });

  it('suppresses autofill by default and offers the field its real purpose on request', async () => {
    await fixture.whenStable();

    expect(input().getAttribute('autocomplete')).toBe('off');

    fixture.componentRef.setInput('autocomplete', 'tel');
    await fixture.whenStable();

    expect(input().getAttribute('autocomplete')).toBe('tel');
  });

  it('reports what was typed rather than deciding anything about it', async () => {
    const typed: string[] = [];

    fixture.componentInstance.value.subscribe((v) => typed.push(v));
    await fixture.whenStable();

    input().value = '800';
    input().dispatchEvent(new Event('input'));

    expect(typed).toEqual(['800']);
    expect(fixture.componentInstance.value()).toBe('800');
  });

  it('lets the caller write the value back, which is what two-way binding needs', async () => {
    await fixture.whenStable();

    input().value = '80';
    input().dispatchEvent(new Event('input'));

    fixture.componentInstance.value.set('+380');
    await fixture.whenStable();

    expect(input().value).toBe('+380');
  });

  it('asks for a text keyboard by default and a numeric one when told', async () => {
    await fixture.whenStable();

    expect(input().getAttribute('inputmode')).toBe('text');

    fixture.componentRef.setInput('inputmode', 'numeric');
    await fixture.whenStable();

    expect(input().getAttribute('inputmode')).toBe('numeric');
  });

  it('stays a single-line input until it is asked for a number of rows', async () => {
    await fixture.whenStable();

    expect(host().querySelector('input.field__input')).not.toBeNull();
    expect(host().querySelector('textarea')).toBeNull();

    fixture.componentRef.setInput('rows', 4);
    await fixture.whenStable();

    expect(host().querySelector('input')).toBeNull();
    expect(host().querySelector('textarea.field__input')?.getAttribute('rows')).toBe('4');
  });

  it('reports what was typed into the multi-line control as well', async () => {
    fixture.componentRef.setInput('rows', 3);
    await fixture.whenStable();

    const area = host().querySelector<HTMLTextAreaElement>('.field__input')!;

    area.value = 'Кухня служить другий рік.';
    area.dispatchEvent(new Event('input'));

    expect(fixture.componentInstance.value()).toBe('Кухня служить другий рік.');
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function input(): HTMLInputElement {
    return host().querySelector<HTMLInputElement>('.field__input')!;
  }
});

describe('TextField bound to a Signal Forms field', () => {
  let fixture: ComponentFixture<PrefilledFieldHost>;
  let control: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PrefilledFieldHost] }).compileComponents();

    fixture = TestBed.createComponent(PrefilledFieldHost);
    await fixture.whenStable();
    control = controlOf(fixture);
  });

  it('shows what the field already holds, without the caller wiring a value binding', () => {
    expect(control.value).toBe('Олена');
  });

  it('carries what was typed into the form model', async () => {
    await type(fixture, 'Марія');

    expect(fixture.componentInstance.model().name).toBe('Марія');
  });

  it('carries a write to the model back into the control, which is the direction a reset needs', async () => {
    await type(fixture, 'Марія');

    fixture.componentInstance.model.set({ name: '' });
    await fixture.whenStable();

    expect(fixture.componentInstance.held.name().value()).toBe('');
    expect(control.value).toBe('');
  });
});

describe('TextField reset to the value its field started with', () => {
  let fixture: ComponentFixture<EmptyFieldHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyFieldHost] }).compileComponents();

    fixture = TestBed.createComponent(EmptyFieldHost);
    await fixture.whenStable();
  });

  it('clears the control as well as the field, which is the case a plain "reset" is made of', async () => {
    await type(fixture, 'Олена');

    fixture.componentInstance.model.set({ name: '' });
    await fixture.whenStable();

    expect(fixture.componentInstance.held.name().value()).toBe('');
    expect(controlOf(fixture).value).toBe('');
  });
});

function controlOf(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('.field__input')!;
}

async function type(fixture: ComponentFixture<unknown>, text: string): Promise<void> {
  const control = controlOf(fixture);

  control.value = text;
  control.dispatchEvent(new Event('input'));
  await fixture.whenStable();
}
