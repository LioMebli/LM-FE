import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, convertToParamMap } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { productResolver } from './product-resolver';
import { ProblemDetail, ProductDetail } from '../../core/api/catalog.types';
import { environment } from '../../../environments/environment';

describe('productResolver', () => {
  const productUrl = `${environment.apiBaseUrl}/api/v1/products/1042`;

  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('answers with the product', async () => {
    const resolved = resolve();
    httpMock.expectOne(productUrl).flush(product());

    expect(await resolved).toEqual(product());
  });

  it('answers with null when the catalog says this product does not exist', async () => {
    const resolved = resolve();
    httpMock
      .expectOne(productUrl)
      .flush(problem('PRODUCT_NOT_FOUND'), { status: 404, statusText: 'Not Found' });

    expect(await resolved).toBeNull();
  });

  it('fails on a 404 that means the caller asked the wrong address', async () => {
    const resolved = resolve();
    httpMock
      .expectOne(productUrl)
      .flush(problem('ENDPOINT_NOT_FOUND'), { status: 404, statusText: 'Not Found' });

    await expect(resolved).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  it('fails when the catalog is broken', async () => {
    const resolved = resolve();
    httpMock
      .expectOne(productUrl)
      .flush(problem('INTERNAL_ERROR'), { status: 500, statusText: 'Internal Server Error' });

    await expect(resolved).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  it('fails when the catalog cannot be reached', async () => {
    const resolved = resolve();
    httpMock.expectOne(productUrl).error(new ProgressEvent('error'));

    await expect(resolved).rejects.toBeInstanceOf(HttpErrorResponse);
  });

  function resolve(id = '1042'): Promise<ProductDetail | null> {
    const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;
    const resolved = TestBed.runInInjectionContext(() =>
      productResolver(route, {} as RouterStateSnapshot),
    );

    return firstValueFrom(resolved as Observable<ProductDetail | null>);
  }

  function product(): ProductDetail {
    return {
      id: 1042,
      categoryId: 1,
      name: 'Ручка-скоба РС-115',
      shortDescription: null,
      description: null,
      availability: 'IN_STOCK',
    };
  }

  function problem(code: string): ProblemDetail {
    return { type: 'about:blank', title: 'Error', status: 404, code };
  }
});
