import { writeFile } from 'node:fs/promises';

const DEFAULT_API_BASE_URL = 'https://api.liomebli.com.ua';
const MANIFEST_PATH = '.catalog-manifest.json';

export async function buildManifest({ apiBaseUrl, fetch }) {
  const categories = await readList(apiBaseUrl, fetch, '/api/v1/categories');
  const products = await readList(apiBaseUrl, fetch, '/api/v1/products');

  return { readAt: new Date().toISOString(), apiBaseUrl, categories, products };
}

export async function writeManifest(manifest, manifestPath) {
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

async function readList(apiBaseUrl, fetch, path) {
  const url = `${apiBaseUrl}${path}`;
  let response;

  try {
    response = await fetch(url);
  } catch (cause) {
    throw new Error(`Catalog read failed: ${url} could not be reached — ${cause.message}`, {
      cause,
    });
  }

  if (!response.ok) {
    throw new Error(`Catalog read failed: ${url} answered ${response.status}`);
  }

  return response.json();
}

if (import.meta.main) {
  const apiBaseUrl = process.env.LM_API_BASE_URL ?? DEFAULT_API_BASE_URL;

  try {
    const manifest = await buildManifest({ apiBaseUrl, fetch: globalThis.fetch });
    await writeManifest(manifest, MANIFEST_PATH);
    console.log(
      `Read ${manifest.categories.length} categories and ${manifest.products.length} products ` +
        `from ${apiBaseUrl} into ${MANIFEST_PATH}`,
    );
  } catch (failure) {
    console.error(failure.message);
    process.exitCode = 1;
  }
}
