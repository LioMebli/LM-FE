import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { CatalogApi } from '../../core/api/catalog-api';
import { CategoryResponse } from '../../core/api/catalog.types';

export const catalogResolver: ResolveFn<CategoryResponse[]> = () =>
  inject(CatalogApi).listCategories();
