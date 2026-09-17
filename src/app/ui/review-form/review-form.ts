import { Component, computed, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';

import { TextField } from '../text-field/text-field';

type Outcome = 'idle' | 'refused' | 'sent';

@Component({
  selector: 'app-review-form',
  imports: [FormField, TextField],
  templateUrl: './review-form.html',
  styleUrl: './review-form.scss',
})
export class ReviewForm {
  protected readonly model = signal({ name: '', review: '' });

  protected readonly reviewForm = form(this.model, (path) => {
    required(path.name);
    required(path.review);
  });

  protected readonly outcome = signal<Outcome>('idle');

  protected readonly nameProblem = computed(() =>
    this.outcome() === 'refused' && this.reviewForm.name().invalid()
      ? 'Вкажіть, як до вас звертатися'
      : undefined,
  );

  protected readonly reviewProblem = computed(() =>
    this.outcome() === 'refused' && this.reviewForm.review().invalid()
      ? 'Напишіть кілька слів про свій досвід'
      : undefined,
  );

  protected send(event: Event): void {
    event.preventDefault();

    if (this.reviewForm.name().invalid() || this.reviewForm.review().invalid()) {
      this.outcome.set('refused');

      return;
    }

    this.outcome.set('sent');
  }
}
