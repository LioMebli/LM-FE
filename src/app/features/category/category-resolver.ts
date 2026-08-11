import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, forkJoin, of, throwError } from 'rxjs';

import { CatalogApi, isMissing } from '../../core/api/catalog-api';
import { CATEGORY_NOT_FOUND, CategoryResponse, ProductSummary } from '../../core/api/catalog.types';

export interface CategoryWithProducts {
  category: CategoryResponse;
  products: ProductSummary[];
}

export const categoryResolver: ResolveFn<CategoryWithProducts | null> = (route) => {
  const id = Number(route.paramMap.get('id'));
  const catalog = inject(CatalogApi);

  return forkJoin({
    category: catalog.getCategory(id),
    products: catalog.listProductsInCategory(id),
  }).pipe(
    catchError((failure: unknown) =>
      isMissing(failure, CATEGORY_NOT_FOUND) ? of(null) : throwError(() => failure),
    ),
  );
};
