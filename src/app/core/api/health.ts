import { HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { ApiClient } from './api-client';

export type ReachabilityOutcome =
  | { reachable: true; httpStatus: number }
  | { reachable: false };

const PROBE_PATH = '/api/v1/health';

@Service()
export class BackendReachability {
  private readonly api = inject(ApiClient);

  probe(): Observable<ReachabilityOutcome> {
    return this.api.get<unknown>(PROBE_PATH).pipe(
      map(() => ({ reachable: true, httpStatus: 200 }) as ReachabilityOutcome),
      catchError((response: HttpErrorResponse) =>
        of(
          response.status === 0
            ? ({ reachable: false } as ReachabilityOutcome)
            : ({ reachable: true, httpStatus: response.status } as ReachabilityOutcome),
        ),
      ),
    );
  }
}
