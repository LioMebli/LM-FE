import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { CategoryWithProducts, categoryResolver } from './category-resolver';
import { CategoryResponse, ProblemDetail, ProductSummary } from '../../core/api/catalog.types';
import { environment } from '../../../environments/environment';

describe('categoryResolver', () => {
  const categoryUrl = `${environment.apiBaseUrl}/api/v1/categories/1`;
  const productsUrl = `${environment.apiBaseUrl}/api/v1/categories/1/products`;

  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify({ ignoreCancelled: true }));

  it('answers with the category and the products it holds', async () => {
    const resolved = resolve();
    const requests = expectBoth();
    requests.category.flush(category());
    requests.products.flush(products());

    expect(await resolved).toEqual({ category: category(), products: products() });
  });

  it('treats a category holding no products as an answer, not as a not-found', async () => {
    const resolved = resolve();
    const requests = expectBoth();
    requests.category.flush(category());
    requests.products.flush([]);

    expect(await resolved).toEqual({ category: category(), products: [] });
  });

  it('answers with null when the catalog says this category does not exist', async () => {
    const resolved = resolve();
    expectBoth().category.flush(problem('CATEGORY_NOT_FOUND'), {
      status: 404,
      statusText: 'Not Found',
    });

    expect(await resolved).toBeNull();
  });

  it('fails on a 404 that means the caller asked the wrong address', async () => {
    const resolved = resolve();
    expectBoth().category.flush(problem('ENDPOINT_NOT_FOUND'), {
      status: 404,
      statusText: 'Not Found',
    });

    await expect(resolved).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  it('fails when the catalog is broken', async () => {
    const resolved = resolve();
    expectBoth().products.flush(problem('INTERNAL_ERROR'), {
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(resolved).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  it('fails when the catalog cannot be reached', async () => {
    const resolved = resolve();
    expectBoth().category.error(new ProgressEvent('error'));

    await expect(resolved).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  function resolve(id = '1'): Promise<CategoryWithProducts | null> {
    const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;
    const resolved = TestBed.runInInjectionContext(() =>
      categoryResolver(route, {} as RouterStateSnapshot),
    );

    return firstValueFrom(resolved as Observable<CategoryWithProducts | null>);
  }

  function expectBoth(): { category: TestRequest; products: TestRequest } {
    return {
      category: httpMock.expectOne(categoryUrl),
      products: httpMock.expectOne(productsUrl),
    };
  }

  function category(): CategoryResponse {
    return { id: 1, name: 'Ручки меблеві' };
  }

  function products(): ProductSummary[] {
    return [
      { id: 1042, categoryId: 1, name: 'Ручка-скоба РС-115' },
      { id: 7, categoryId: 1, name: 'Ручка-кнопка РК-20' },
    ];
  }

  function problem(code: string): ProblemDetail {
    return { type: 'about:blank', title: 'Error', status: 404, code };
  }
});
