import { readFile } from 'node:fs/promises';

import { RenderMode, ServerRoute } from '@angular/ssr';

const MANIFEST_PATH = '.catalog-manifest.json';

interface CatalogManifest {
  categories: { id: number }[];
  products: { id: number }[];
}

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'category/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => idsFromManifest('categories'),
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => idsFromManifest('products'),
  },
  { path: 'design-system', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];

async function idsFromManifest(collection: keyof CatalogManifest): Promise<{ id: string }[]> {
  const manifest = await readManifest();

  return manifest[collection].map((item) => ({ id: String(item.id) }));
}

async function readManifest(): Promise<CatalogManifest> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as CatalogManifest;
  } catch (cause) {
    throw new Error(
      `Prerender failed: ${MANIFEST_PATH} could not be read — run "npm run build:manifest" first`,
      { cause },
    );
  }
}
