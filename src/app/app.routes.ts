import { Routes } from '@angular/router';

import { catalogResolver } from './features/catalog/catalog-resolver';
import { categoryResolver } from './features/category/category-resolver';
import { productResolver } from './features/product/product-resolver';

const notFoundPage = () =>
  import('./features/not-found/not-found-page').then((m) => m.NotFoundPage);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/catalog/catalog-page').then((m) => m.CatalogPage),
    resolve: { categories: catalogResolver },
  },
  {
    path: 'category/:id',
    loadComponent: () => import('./features/category/category-page').then((m) => m.CategoryPage),
    resolve: { category: categoryResolver },
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/product/product-page').then((m) => m.ProductPage),
    resolve: { product: productResolver },
  },
  { path: '404', loadComponent: notFoundPage },
  { path: '**', loadComponent: notFoundPage },
];
