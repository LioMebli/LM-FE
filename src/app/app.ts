import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BackendReachability } from './core/api/health';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <main class="skeleton">
      <h1>LioMebli</h1>
      <p>Наскрізний зріз: браузер → API.</p>

      <button type="button" [disabled]="pending()" (click)="probe()">
        Перевірити звʼязок із API
      </button>

      <p class="outcome" role="status" aria-live="polite">
        @if (pending()) {
          Запит виконується…
        } @else if (message()) {
          {{ message() }}
        }
      </p>
    </main>
    <router-outlet />
  `,
  styles: `
    .skeleton {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      max-width: 40rem;
    }

    button {
      min-height: 44px;
      padding: 0 1rem;
    }

    .outcome {
      min-height: 1.5rem;
      margin: 0;
    }
  `,
})
export class App {
  private readonly backend = inject(BackendReachability);

  protected readonly message = signal<string | null>(null);
  protected readonly pending = signal(false);

  protected probe(): void {
    this.pending.set(true);
    this.message.set(null);

    this.backend.probe().subscribe((outcome) => {
      this.message.set(
        outcome.reachable
          ? `Відповідь отримано, HTTP ${outcome.httpStatus}. Крос-доменний запит пройшов.`
          : 'Відповіді немає: API не запущено або запит заблоковано CORS.',
      );
      this.pending.set(false);
    });
  }
}
