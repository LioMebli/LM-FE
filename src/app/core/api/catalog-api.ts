import { HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from './api-client';
import { CategoryResponse, ProblemDetail, ProductDetail, ProductSummary } from './catalog.types';

@Service()
export class CatalogApi {
  private readonly api = inject(ApiClient);

  listCategories(): Observable<CategoryResponse[]> {
    return this.api.get<CategoryResponse[]>('/api/v1/categories');
  }

  getCategory(id: number): Observable<CategoryResponse> {
    return this.api.get<CategoryResponse>(`/api/v1/categories/${id}`);
  }

  listProductsInCategory(id: number): Observable<ProductSummary[]> {
    return this.api.get<ProductSummary[]>(`/api/v1/categories/${id}/products`);
  }

  getProduct(id: number): Observable<ProductDetail> {
    return this.api.get<ProductDetail>(`/api/v1/products/${id}`);
  }
}

export function isMissing(failure: unknown, code: string): boolean {
  if (!(failure instanceof HttpErrorResponse) || failure.status !== 404) {
    return false;
  }

  return (failure.error as ProblemDetail | null)?.code === code;
}
