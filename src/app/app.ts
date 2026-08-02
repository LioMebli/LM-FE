import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div class="healthcheck-test">
      <p aria-live="polite">
        @if (loading()) {
          Завантаження...
        } @else if (error()) {
          Помилка: {{ error() }}
        } @else if (result() !== null) {
          {{ result() }}
        }
      </p>
      <button type="button" (click)="checkHealth()">Перевірити healthcheck</button>
    </div>
    <router-outlet />
  `,
  styles: `
    .healthcheck-test {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
      padding: 1rem;
    }
  `,
})
export class App {
  private readonly http = inject(HttpClient);

  protected readonly result = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected checkHealth(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get('http://localhost:8080/healthcheck', { responseType: 'text' }).subscribe({
      next: (response) => {
        this.result.set(response);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof Error ? err.message : 'Не вдалося виконати запит');
        this.loading.set(false);
      },
    });
  }
}
