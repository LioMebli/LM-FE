import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const DEFAULT_SITE_ORIGIN = 'https://liomebli.com.ua';
const MANIFEST_PATH = '.catalog-manifest.json';
const OUTPUT_DIR = 'dist/LM-FE/browser';
const SHELL_INDEX_PATH = 'src/index.html';

const CATALOG_ROOT_ROUTE = '/';
const NOT_FOUND_ROUTE = '/404';
const SHOWCASE_ROUTE = '/design-system';
const ROUTES_OUTSIDE_THE_CATALOG = [CATALOG_ROOT_ROUTE, NOT_FOUND_ROUTE, SHOWCASE_ROUTE];

const UNPUBLISHED_ROUTES = new Map([
  [NOT_FOUND_ROUTE, 'the not-found page is never offered to a crawler'],
  [SHOWCASE_ROUTE, 'the design-system showcase is never offered to a crawler'],
]);

const MAX_INITIAL_SCRIPT_BYTES = 250_000;

const AVAILABILITY_LABELS = ['В наявності', 'Під замовлення', 'Знято з виробництва'];

const ESCAPED_TEXT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\u00A0': '&nbsp;' };
const ESCAPABLE_TEXT = /[&<>\u00A0]/g;

const LOCATION = /<loc>([^<]+)<\/loc>/g;
const TITLE = /<title>([^<]*)<\/title>/;
const BODY = /<body[^>]*>([\s\S]*)<\/body>/;
const SCRIPT_ELEMENT = /<script[\s\S]*?<\/script>/g;
const CANONICAL_LINK = /<link[^>]*rel="canonical"[^>]*>/;
const NOINDEX_META = /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i;
const OPENING_SCRIPT_TAG = /<script[^>]*>/g;
const LINK_TAG = /<link[^>]*>/g;
const HREF = /href="([^"]*)"/;
const SRC = /src="([^"]*)"/;

export async function runSiteChecks({ manifestPath, outputDir, shellIndexPath, siteOrigin }) {
  const manifest = await readManifest(manifestPath);
  const emptyCatalog = checkCatalogIsNotEmpty(manifest, manifestPath);

  if (emptyCatalog.length > 0) {
    return { failures: emptyCatalog, notes: [] };
  }

  const pages = await readProducedPages(outputDir);
  const shellTitle = await readShellTitle(shellIndexPath);
  const initialScripts = await checkInitialScripts(outputDir, pages.get(CATALOG_ROOT_ROUTE));

  return {
    failures: [
      ...checkCoverage(manifest, pages),
      ...checkProductPages(manifest.products, pages),
      ...(await checkNotFoundCopy(outputDir, pages)),
      ...checkInternalPagesAreNotIndexed(pages),
      ...(await checkSitemap(outputDir, pages, siteOrigin)),
      ...(await checkRobots(outputDir, siteOrigin)),
      ...checkTitles(pages, shellTitle),
      ...checkCanonicals(pages, siteOrigin),
      ...initialScripts.failures,
    ],
    notes: [...duplicateTitleNotes(pages), ...initialScripts.notes],
  };
}

function checkCatalogIsNotEmpty({ categories = [], products = [] }, manifestPath) {
  const failures = [];

  if (categories.length === 0) {
    failures.push(`${manifestPath} names no categories — an empty catalog must not be published`);
  }

  if (products.length === 0) {
    failures.push(`${manifestPath} names no products — an empty catalog must not be published`);
  }

  return failures;
}

function checkCoverage({ categories, products }, pages) {
  const expected = new Set([
    ...ROUTES_OUTSIDE_THE_CATALOG,
    ...categories.map((category) => `/category/${category.id}`),
    ...products.map((product) => `/product/${product.id}`),
  ]);
  const produced = new Set(pages.keys());

  return [
    ...[...expected.difference(produced)].map(
      (route) => `No page was produced for ${route}, which the catalog names`,
    ),
    ...[...produced.difference(expected)].map(
      (route) => `A page was produced for ${route}, which the catalog does not name`,
    ),
  ];
}

function checkProductPages(products, pages) {
  return products.flatMap((product) => {
    const route = `/product/${product.id}`;
    const html = pages.get(route);

    if (html === undefined) {
      return [];
    }

    const rendered = renderedBodyOf(html);
    const failures = [];

    if (!rendered.includes(escapeHtmlText(product.name))) {
      failures.push(`${route} does not render the product name "${product.name}"`);
    }

    if (!AVAILABILITY_LABELS.some((label) => rendered.includes(label))) {
      failures.push(`${route} renders none of the availability labels`);
    }

    return failures;
  });
}

async function checkNotFoundCopy(outputDir, pages) {
  const copyPath = join(outputDir, '404.html');
  const copy = await readIfPresent(copyPath);

  if (copy === undefined) {
    return [`${copyPath} is missing — the host has no not-found page to serve`];
  }

  const failures = [];
  const source = pages.get(NOT_FOUND_ROUTE);

  if (source !== undefined && copy !== source) {
    failures.push(`${copyPath} differs from the ${NOT_FOUND_ROUTE} page it is copied from`);
  }

  if (!NOINDEX_META.test(copy)) {
    failures.push(`${copyPath} does not carry <meta name="robots" content="noindex">`);
  }

  return failures;
}

function checkInternalPagesAreNotIndexed(pages) {
  return [...UNPUBLISHED_ROUTES.keys()].flatMap((route) => {
    const html = pages.get(route);

    if (html === undefined || NOINDEX_META.test(html)) {
      return [];
    }

    return [`${route} does not carry <meta name="robots" content="noindex">`];
  });
}

async function checkSitemap(outputDir, pages, siteOrigin) {
  const sitemapPath = join(outputDir, 'sitemap.xml');
  const sitemap = await readIfPresent(sitemapPath);

  if (sitemap === undefined) {
    return [`${sitemapPath} is missing — a crawler has no address list to read`];
  }

  const listed = new Set([...sitemap.matchAll(LOCATION)].map(([, location]) => location));
  const expected = new Set(
    [...pages.keys()]
      .filter((route) => !UNPUBLISHED_ROUTES.has(route))
      .map((route) => `${siteOrigin}${route}`),
  );

  const failures = [];

  for (const [route, reason] of UNPUBLISHED_ROUTES) {
    const location = `${siteOrigin}${route}`;

    if (listed.delete(location)) {
      failures.push(`${sitemapPath} lists ${location} — ${reason}`);
    }
  }

  failures.push(
    ...[...expected.difference(listed)].map(
      (location) => `${sitemapPath} does not list ${location}, which the release produced`,
    ),
    ...[...listed.difference(expected)].map(
      (location) => `${sitemapPath} lists ${location}, which the release did not produce`,
    ),
  );

  return failures;
}

async function checkRobots(outputDir, siteOrigin) {
  const robotsPath = join(outputDir, 'robots.txt');
  const robots = await readIfPresent(robotsPath);

  if (robots === undefined) {
    return [`${robotsPath} is missing — a crawler is not told where the address list is`];
  }

  const sitemapLine = `Sitemap: ${siteOrigin}/sitemap.xml`;

  return robots.includes(sitemapLine) ? [] : [`${robotsPath} does not carry "${sitemapLine}"`];
}

function checkTitles(pages, shellTitle) {
  return [...pages].flatMap(([route, html]) => {
    const title = titleOf(html);

    if (title === '') {
      return [`${route} has no <title>`];
    }

    if (title === shellTitle) {
      return [`${route} carries the app shell's title "${shellTitle}" instead of its own`];
    }

    return [];
  });
}

function duplicateTitleNotes(pages) {
  const routesByTitle = new Map();

  for (const [route, html] of pages) {
    const title = titleOf(html);

    routesByTitle.set(title, [...(routesByTitle.get(title) ?? []), route]);
  }

  return [...routesByTitle]
    .filter(([, routes]) => routes.length > 1)
    .map(([title, routes]) => `Duplicate title "${title}" on ${routes.join(', ')}`);
}

function checkCanonicals(pages, siteOrigin) {
  return [...pages].flatMap(([route, html]) => {
    const link = CANONICAL_LINK.exec(html)?.[0];

    if (link === undefined) {
      return [`${route} carries no <link rel="canonical">`];
    }

    const expected = `${siteOrigin}${route}`;
    const href = HREF.exec(link)?.[1];

    return href === expected
      ? []
      : [`${route} names "${href}" as its canonical address, not "${expected}"`];
  });
}

async function checkInitialScripts(outputDir, catalogRoot) {
  if (catalogRoot === undefined) {
    return { failures: [], notes: [] };
  }

  const failures = [];
  let bytes = 0;

  for (const source of initialScriptSources(catalogRoot)) {
    const scriptPath = join(outputDir, source);

    try {
      bytes += gzipSync(await readFile(scriptPath)).length;
    } catch {
      failures.push(
        `${scriptPath} is loaded by ${CATALOG_ROOT_ROUTE} but was not produced, so it weighs nothing here`,
      );
    }
  }

  if (bytes > MAX_INITIAL_SCRIPT_BYTES) {
    failures.push(
      `Initial JavaScript is ${bytes} bytes gzipped, above the limit of ${MAX_INITIAL_SCRIPT_BYTES} bytes`,
    );
  }

  return {
    failures,
    notes: [`Initial JavaScript: ${bytes} bytes gzipped, limit ${MAX_INITIAL_SCRIPT_BYTES} bytes`],
  };
}

function initialScriptSources(html) {
  const scripts = [...html.matchAll(OPENING_SCRIPT_TAG)].map(([tag]) => SRC.exec(tag)?.[1]);
  const preloads = [...html.matchAll(LINK_TAG)]
    .filter(([tag]) => tag.includes('rel="modulepreload"'))
    .map(([tag]) => HREF.exec(tag)?.[1]);

  return new Set([...scripts, ...preloads].filter((source) => source !== undefined));
}

async function readIfPresent(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return undefined;
  }
}

async function readManifest(manifestPath) {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (cause) {
    throw new Error(
      `Checks failed: ${manifestPath} could not be read — run "npm run build:manifest" first`,
      { cause },
    );
  }
}

async function readProducedPages(outputDir) {
  let entries;

  try {
    entries = await readdir(outputDir, { recursive: true, withFileTypes: true });
  } catch (cause) {
    throw new Error(`Checks failed: ${outputDir} could not be read — run "npm run build" first`, {
      cause,
    });
  }

  const pages = new Map();

  for (const entry of entries.filter((candidate) => candidate.name === 'index.html')) {
    const html = await readFile(join(entry.parentPath, entry.name), 'utf8');

    pages.set(routeOf(outputDir, entry.parentPath), html);
  }

  return pages;
}

async function readShellTitle(shellIndexPath) {
  try {
    return titleOf(await readFile(shellIndexPath, 'utf8'));
  } catch (cause) {
    throw new Error(
      `Checks failed: ${shellIndexPath} could not be read — the gate cannot tell a page's own title from the app shell's`,
      { cause },
    );
  }
}

function routeOf(outputDir, parentPath) {
  const directory = relative(outputDir, parentPath).split(sep).join('/');

  return directory === '' ? CATALOG_ROOT_ROUTE : `/${directory}`;
}

function titleOf(html) {
  return TITLE.exec(html)?.[1].trim() ?? '';
}

function renderedBodyOf(html) {
  return (BODY.exec(html)?.[1] ?? '').replace(SCRIPT_ELEMENT, '');
}

function escapeHtmlText(text) {
  return text.replace(ESCAPABLE_TEXT, (character) => ESCAPED_TEXT[character]);
}

if (import.meta.main) {
  const siteOrigin = process.env.LM_SITE_ORIGIN ?? DEFAULT_SITE_ORIGIN;

  try {
    const { failures, notes } = await runSiteChecks({
      manifestPath: MANIFEST_PATH,
      outputDir: OUTPUT_DIR,
      shellIndexPath: SHELL_INDEX_PATH,
      siteOrigin,
    });

    for (const note of notes) {
      console.log(note);
    }

    for (const failure of failures) {
      console.error(failure);
    }

    if (failures.length > 0) {
      console.error(
        `${failures.length} check${failures.length === 1 ? '' : 's'} failed — this release must not be published`,
      );
      process.exitCode = 1;
    } else {
      console.log(`Checked ${OUTPUT_DIR} against ${MANIFEST_PATH}, addressed at ${siteOrigin}`);
    }
  } catch (failure) {
    console.error(failure.message);
    process.exitCode = 1;
  }
}
