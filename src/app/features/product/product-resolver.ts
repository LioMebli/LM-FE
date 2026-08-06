import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, throwError } from 'rxjs';

import { CatalogApi, isMissing } from '../../core/api/catalog-api';
import { PRODUCT_NOT_FOUND, ProductDetail } from '../../core/api/catalog.types';

export const productResolver: ResolveFn<ProductDetail | null> = (route) =>
  inject(CatalogApi)
    .getProduct(Number(route.paramMap.get('id')))
    .pipe(
      catchError((failure: unknown) =>
        isMissing(failure, PRODUCT_NOT_FOUND) ? of(null) : throwError(() => failure),
      ),
    );
