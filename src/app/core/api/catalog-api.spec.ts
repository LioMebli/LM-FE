import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CatalogApi } from './catalog-api';
import { environment } from '../../../environments/environment';

describe('CatalogApi', () => {
  let api: CatalogApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(CatalogApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reads every category', () => {
    api.listCategories().subscribe();

    expectGet('/api/v1/categories');
  });

  it('reads one category by identifier', () => {
    api.getCategory(1).subscribe();

    expectGet('/api/v1/categories/1');
  });

  it('reads the products of one category', () => {
    api.listProductsInCategory(1).subscribe();

    expectGet('/api/v1/categories/1/products');
  });

  it('reads one product by identifier', () => {
    api.getProduct(1042).subscribe();

    expectGet('/api/v1/products/1042');
  });

  function expectGet(path: string): void {
    const request = httpMock.expectOne(`${environment.apiBaseUrl}${path}`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  }
});
