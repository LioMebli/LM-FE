import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { renderRobots, renderSitemap, writeSiteArtifacts } from './site-artifacts.mjs';

const SITE_ORIGIN = 'https://liomebli.com.ua';
const CATEGORIES = [
  { id: 1, name: 'Ручки меблеві' },
  { id: 2, name: 'Петлі' },
];
const PRODUCTS = [{ id: 1042, categoryId: 1, name: 'Ручка-скоба РС-115' }];
const NOT_FOUND_HTML =
  '<!doctype html><html lang="uk"><head><meta name="robots" content="noindex"></head></html>';

describe('renderSitemap', () => {
  it('names the catalog root, every category and every product, absolutely', () => {
    const sitemap = renderSitemap({
      siteOrigin: SITE_ORIGIN,
      categories: CATEGORIES,
      products: PRODUCTS,
    });

    expect(locations(sitemap)).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/category/1`,
      `${SITE_ORIGIN}/category/2`,
      `${SITE_ORIGIN}/product/1042`,
    ]);
  });

  it('keeps the not-found page out of the address list', () => {
    const sitemap = renderSitemap({
      siteOrigin: SITE_ORIGIN,
      categories: CATEGORIES,
      products: PRODUCTS,
    });

    expect(sitemap).not.toContain('404');
  });

  it('claims nothing it cannot know about when a page last changed', () => {
    const sitemap = renderSitemap({ siteOrigin: SITE_ORIGIN, categories: [], products: [] });

    expect(sitemap).not.toContain('lastmod');
    expect(sitemap).not.toContain('changefreq');
    expect(sitemap).not.toContain('priority');
  });
});

describe('renderRobots', () => {
  it('points a crawler at the address list, absolutely', () => {
    expect(renderRobots(SITE_ORIGIN)).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
  });

  it('disallows nothing, so that a noindex tag can be read', () => {
    expect(renderRobots(SITE_ORIGIN)).not.toContain('Disallow');
  });
});

describe('writeSiteArtifacts', () => {
  let directory;
  let outputDir;
  let manifestPath;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'lm-artifacts-'));
    outputDir = join(directory, 'browser');
    manifestPath = join(directory, '.catalog-manifest.json');

    await mkdir(outputDir, { recursive: true });
    await writeFile(
      manifestPath,
      JSON.stringify({ categories: CATEGORIES, products: PRODUCTS }),
      'utf8',
    );
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('copies the prerendered not-found page to where the host looks for it', async () => {
    await givenPrerendered404();

    await writeSiteArtifacts({ manifestPath, outputDir, siteOrigin: SITE_ORIGIN });

    expect(await readFile(join(outputDir, '404.html'), 'utf8')).toBe(NOT_FOUND_HTML);
  });

  it('writes both machine-readable files', async () => {
    await givenPrerendered404();

    await writeSiteArtifacts({ manifestPath, outputDir, siteOrigin: SITE_ORIGIN });

    expect(locations(await readFile(join(outputDir, 'sitemap.xml'), 'utf8'))).toHaveLength(4);
    expect(await readFile(join(outputDir, 'robots.txt'), 'utf8')).toContain('Sitemap:');
  });

  it('fails naming the file it expected the build to have produced', async () => {
    await expect(
      writeSiteArtifacts({ manifestPath, outputDir, siteOrigin: SITE_ORIGIN }),
    ).rejects.toThrow(join('404', 'index.html'));
  });

  async function givenPrerendered404() {
    await mkdir(join(outputDir, '404'), { recursive: true });
    await writeFile(join(outputDir, '404', 'index.html'), NOT_FOUND_HTML, 'utf8');
  }
});

function locations(sitemap) {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, location]) => location);
}
