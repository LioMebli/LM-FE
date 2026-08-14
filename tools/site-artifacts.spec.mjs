import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  renderHeaders,
  renderRobots,
  renderSitemap,
  writeSiteArtifacts,
} from './site-artifacts.mjs';
import { PRODUCTION_SITE_ORIGIN } from './site-config.mjs';

const SITE_ORIGIN = PRODUCTION_SITE_ORIGIN;
const DEV_SITE_ORIGIN = 'https://dev.liomebli.com.ua';
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

  it('turns a crawler away from any origin that is not the public one', () => {
    expect(renderRobots(DEV_SITE_ORIGIN)).toContain('Disallow: /');
    expect(renderRobots('http://localhost:4200')).toContain('Disallow: /');
  });

  it('names no address list on a closed site, since it publishes none', () => {
    expect(renderRobots(DEV_SITE_ORIGIN)).not.toContain('Sitemap');
  });
});

describe('renderHeaders', () => {
  it('forbids indexing under every address, not only under some prefix', () => {
    expect(renderHeaders()).toBe('/*\n  X-Robots-Tag: noindex\n');
  });
});

describe('the production artifacts LM-11 published', () => {
  it('renders robots.txt exactly as the previous release did', () => {
    expect(renderRobots(SITE_ORIGIN)).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://liomebli.com.ua/sitemap.xml\n',
    );
  });

  it('renders sitemap.xml exactly as the previous release did', () => {
    expect(renderSitemap({ siteOrigin: SITE_ORIGIN, categories: CATEGORIES, products: PRODUCTS }))
      .toBe(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://liomebli.com.ua/</loc></url>
  <url><loc>https://liomebli.com.ua/category/1</loc></url>
  <url><loc>https://liomebli.com.ua/category/2</loc></url>
  <url><loc>https://liomebli.com.ua/product/1042</loc></url>
</urlset>
`);
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

  it('offers a production site an address list and no indexing ban', async () => {
    await givenPrerendered404();

    await writeSiteArtifacts({ manifestPath, outputDir, siteOrigin: SITE_ORIGIN });

    expect(await isPresent('sitemap.xml')).toBe(true);
    expect(await isPresent('_headers')).toBe(false);
  });

  it('closes a site built for any other origin, in both files a host reads', async () => {
    await givenPrerendered404();

    await writeSiteArtifacts({ manifestPath, outputDir, siteOrigin: DEV_SITE_ORIGIN });

    expect(await readFile(join(outputDir, 'robots.txt'), 'utf8')).toContain('Disallow: /');
    expect(await readFile(join(outputDir, '_headers'), 'utf8')).toContain('X-Robots-Tag: noindex');
    expect(await isPresent('sitemap.xml')).toBe(false);
  });

  it('removes what the other posture left behind, so one directory cannot ship both', async () => {
    await givenPrerendered404();

    await writeSiteArtifacts({ manifestPath, outputDir, siteOrigin: DEV_SITE_ORIGIN });
    await writeSiteArtifacts({ manifestPath, outputDir, siteOrigin: SITE_ORIGIN });

    expect(await isPresent('_headers')).toBe(false);
    expect(await isPresent('sitemap.xml')).toBe(true);
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

  async function isPresent(name) {
    try {
      await readFile(join(outputDir, name), 'utf8');
      return true;
    } catch {
      return false;
    }
  }
});

function locations(sitemap) {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, location]) => location);
}
