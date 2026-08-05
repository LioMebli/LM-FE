import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Service()
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.url(path));
  }

  private url(path: string): string {
    return `${environment.apiBaseUrl}${path}`;
  }
}
