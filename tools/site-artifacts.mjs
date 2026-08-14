import { copyFile, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isProductionOrigin, resolveSiteOrigin } from './site-config.mjs';

const MANIFEST_PATH = '.catalog-manifest.json';
const OUTPUT_DIR = 'dist/LM-FE/browser';

export function renderSitemap({ siteOrigin, categories, products }) {
  const paths = [
    '/',
    ...categories.map((category) => `/category/${category.id}`),
    ...products.map((product) => `/product/${product.id}`),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => `  <url><loc>${siteOrigin}${path}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
}

export function renderRobots(siteOrigin) {
  return isProductionOrigin(siteOrigin)
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
}

export function renderHeaders() {
  return '/*\n  X-Robots-Tag: noindex\n';
}

export async function writeSiteArtifacts({ manifestPath, outputDir, siteOrigin }) {
  const { categories, products } = JSON.parse(await readFile(manifestPath, 'utf8'));
  const notFoundSource = join(outputDir, '404', 'index.html');

  try {
    await copyFile(notFoundSource, join(outputDir, '404.html'));
  } catch (cause) {
    throw new Error(
      `Artifacts failed: ${notFoundSource} is missing — the /404 route did not prerender`,
      { cause },
    );
  }

  const sitemapPath = join(outputDir, 'sitemap.xml');
  const headersPath = join(outputDir, '_headers');

  if (isProductionOrigin(siteOrigin)) {
    await writeFile(sitemapPath, renderSitemap({ siteOrigin, categories, products }), 'utf8');
    await rm(headersPath, { force: true });
  } else {
    await writeFile(headersPath, renderHeaders(), 'utf8');
    await rm(sitemapPath, { force: true });
  }

  await writeFile(join(outputDir, 'robots.txt'), renderRobots(siteOrigin), 'utf8');
}

if (import.meta.main) {
  const siteOrigin = resolveSiteOrigin();

  try {
    await writeSiteArtifacts({ manifestPath: MANIFEST_PATH, outputDir: OUTPUT_DIR, siteOrigin });
    console.log(
      isProductionOrigin(siteOrigin)
        ? `Wrote sitemap.xml, robots.txt and 404.html into ${OUTPUT_DIR}, addressed at ${siteOrigin}`
        : `Wrote _headers, robots.txt and 404.html into ${OUTPUT_DIR}, closed to crawlers at ${siteOrigin}`,
    );
  } catch (failure) {
    console.error(failure.message);
    process.exitCode = 1;
  }
}
