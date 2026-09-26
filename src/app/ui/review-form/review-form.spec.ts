import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewForm } from './review-form';

describe('ReviewForm', () => {
  let fixture: ComponentFixture<ReviewForm>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewForm);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('refuses an empty submission and names both fields', async () => {
    await send();

    const messages = fieldMessages();

    expect(host.querySelector('.review__outcome--refused')).not.toBeNull();
    expect(host.querySelector('.review__outcome--sent')).toBeNull();
    expect(messages[0]).toContain('звертатися');
    expect(messages[1]).toContain('досвід');
  });

  it('refuses a submission with only one field filled, and names only the empty one', async () => {
    await type(0, 'Олена');
    await send();

    const messages = fieldMessages();

    expect(host.querySelector('.review__outcome--refused')).not.toBeNull();
    expect(messages[0]).toBe('');
    expect(messages[1]).toContain('досвід');
  });

  it('accepts a complete submission and still refuses to claim it was stored', async () => {
    await type(0, 'Олена');
    await type(1, 'Кухня служить другий рік.');
    await send();

    expect(host.querySelector('.review__outcome--sent')?.textContent).toContain('нікуди не пішов');
    expect(host.querySelector('.review__outcome--refused')).toBeNull();
    expect(fieldMessages()).toEqual(['', '']);
  });

  it('keeps what was typed after sending, because nothing was sent anywhere to keep it', async () => {
    await type(0, 'Олена');
    await type(1, 'Кухня служить другий рік.');
    await send();

    const written = [
      ...host.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.field__input'),
    ].map((control) => control.value);

    expect(written).toEqual(['Олена', 'Кухня служить другий рік.']);
  });

  it('gives the review a multi-line control and the name a single-line one', () => {
    expect(host.querySelectorAll('input.field__input')).toHaveLength(1);
    expect(host.querySelectorAll('textarea.field__input')).toHaveLength(1);
  });

  async function type(index: number, text: string): Promise<void> {
    const control = host.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '.field__input',
    )[index];

    control.value = text;
    control.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function send(): Promise<void> {
    host.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  function fieldMessages(): string[] {
    return [...host.querySelectorAll('.field__message')].map((node) => node.textContent!.trim());
  }
});
