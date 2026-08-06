import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildManifest, writeManifest } from './catalog-manifest.mjs';

const API_BASE_URL = 'http://localhost:8080';
const CATEGORIES = [
  { id: 1, name: 'Ручки меблеві' },
  { id: 2, name: 'Петлі' },
];
const PRODUCTS = [{ id: 1042, categoryId: 1, name: 'Ручка-скоба РС-115' }];

describe('buildManifest', () => {
  it('carries both listings unaltered', async () => {
    const manifest = await buildManifest({ apiBaseUrl: API_BASE_URL, fetch: answering() });

    expect(manifest.categories).toEqual(CATEGORIES);
    expect(manifest.products).toEqual(PRODUCTS);
  });

  it('records which catalog was read, and when', async () => {
    const manifest = await buildManifest({ apiBaseUrl: API_BASE_URL, fetch: answering() });

    expect(manifest.apiBaseUrl).toBe(API_BASE_URL);
    expect(Date.parse(manifest.readAt)).not.toBeNaN();
  });

  it('fails naming the endpoint that answered with an error status', async () => {
    const fetch = answering({ failingPath: '/api/v1/products', status: 503 });

    await expect(buildManifest({ apiBaseUrl: API_BASE_URL, fetch })).rejects.toThrow(
      `${API_BASE_URL}/api/v1/products answered 503`,
    );
  });

  it('fails naming the endpoint that could not be reached', async () => {
    const fetch = async () => {
      throw new Error('ECONNREFUSED');
    };

    await expect(buildManifest({ apiBaseUrl: API_BASE_URL, fetch })).rejects.toThrow(
      `${API_BASE_URL}/api/v1/categories could not be reached`,
    );
  });
});

describe('writeManifest', () => {
  let directory;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'lm-manifest-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('writes a file that parses back into the manifest', async () => {
    const manifest = await buildManifest({ apiBaseUrl: API_BASE_URL, fetch: answering() });
    const path = join(directory, '.catalog-manifest.json');

    await writeManifest(manifest, path);

    const written = JSON.parse(await readFile(path, 'utf8'));
    expect(written).toEqual(manifest);
  });
});

function answering({ failingPath, status } = {}) {
  const bodies = {
    '/api/v1/categories': CATEGORIES,
    '/api/v1/products': PRODUCTS,
  };

  return async (url) => {
    const path = new URL(url).pathname;

    if (path === failingPath) {
      return { ok: false, status };
    }

    return { ok: true, status: 200, json: async () => bodies[path] };
  };
}
