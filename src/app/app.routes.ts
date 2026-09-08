import { Routes } from '@angular/router';

import { categoryResolver } from './features/category/category-resolver';
import { homeResolver } from './features/home/home-resolver';
import { productResolver } from './features/product/product-resolver';

const notFoundPage = () =>
  import('./features/not-found/not-found-page').then((m) => m.NotFoundPage);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
    resolve: { categories: homeResolver },
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
  {
    path: 'design-system',
    loadComponent: () =>
      import('./features/design-system/design-system-page').then((m) => m.DesignSystemPage),
  },
  { path: '404', loadComponent: notFoundPage },
  { path: '**', loadComponent: notFoundPage },
];
