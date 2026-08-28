import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { checkCommentBudget, runSiteChecks } from './site-checks.mjs';

const SITE_ORIGIN = 'https://liomebli.com.ua';
const SHELL_TITLE = 'LioMebli — меблева фурнітура';

const CATEGORIES = [{ id: 1, name: 'Ручки меблеві' }];
const PRODUCTS = [{ id: 1042, categoryId: 1, name: 'Ручка «Класика» & Co' }];
const ESCAPED_PRODUCT_NAME = 'Ручка «Класика» &amp; Co';

const CATALOG_ROUTE = '/';
const NOT_FOUND_ROUTE = '/404';
const SHOWCASE_ROUTE = '/design-system';
const CATEGORY_ROUTE = '/category/1';
const PRODUCT_ROUTE = '/product/1042';

const NOINDEX = '<meta name="robots" content="noindex">';
const MODULEPRELOAD = '<link rel="modulepreload" href="chunk.js">';
const SCRIPT = '<script src="main.js" type="module"></script>';

describe('runSiteChecks', () => {
  let directory;
  let inputs;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'lm-checks-'));
    inputs = {
      manifestPath: join(directory, '.catalog-manifest.json'),
      outputDir: join(directory, 'browser'),
      shellIndexPath: join(directory, 'shell.html'),
      siteOrigin: SITE_ORIGIN,
    };

    await givenAGoodRelease();
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('passes a release that matches the catalog it was built from', async () => {
    const { failures } = await runSiteChecks(inputs);

    expect(failures).toEqual([]);
  });

  it('reports the gzipped initial size even when nothing is wrong', async () => {
    const { notes } = await runSiteChecks(inputs);

    expect(notes).toContainEqual(expect.stringContaining('Initial JavaScript:'));
    expect(notes).toContainEqual(expect.stringContaining('limit 250000 bytes'));
  });

  it('refuses a catalog with no products, and reports nothing else', async () => {
    await writeManifest({ categories: CATEGORIES, products: [] });
    await removePage(PRODUCT_ROUTE);
    await removeFromOutput('robots.txt');

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toEqual([expect.stringContaining('names no products')]);
  });

  it('refuses a catalog with no categories, and reports nothing else', async () => {
    await writeManifest({ categories: [], products: PRODUCTS });
    await removeFromOutput('sitemap.xml');

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toEqual([expect.stringContaining('names no categories')]);
  });

  it('fails naming the product the catalog has but the release does not', async () => {
    await removePage(PRODUCT_ROUTE);

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`No page was produced for ${PRODUCT_ROUTE}`),
    );
  });

  it('fails naming a page the catalog does not account for', async () => {
    await writePage('/product/9999', productPage());

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining('A page was produced for /product/9999'),
    );
  });

  it('fails when a product page carries its raw name instead of the escaped form', async () => {
    await writePage(PRODUCT_ROUTE, productPage({ name: PRODUCTS[0].name }));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`${PRODUCT_ROUTE} does not render the product name`),
    );
  });

  it('fails when the name reaches the page only through the title and the hydration state', async () => {
    await writePage(
      PRODUCT_ROUTE,
      page({
        title: `${ESCAPED_PRODUCT_NAME} — LioMebli`,
        canonical: `${SITE_ORIGIN}${PRODUCT_ROUTE}`,
        body: `<script type="application/json">{"name":"${ESCAPED_PRODUCT_NAME}"}</script><p>В наявності</p>`,
      }),
    );

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`${PRODUCT_ROUTE} does not render the product name`),
    );
  });

  it('fails when a product page renders no availability label', async () => {
    await writePage(PRODUCT_ROUTE, productPage({ availability: '' }));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`${PRODUCT_ROUTE} renders none of the availability labels`),
    );
  });

  it('fails when the host has no 404.html to serve', async () => {
    await removeFromOutput('404.html');

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining('is missing — the host has no not-found page to serve'),
    );
  });

  it('fails when 404.html has drifted from the page it is copied from', async () => {
    await writeToOutput('404.html', `${notFoundPage()}<!-- stale -->`);

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`differs from the ${NOT_FOUND_ROUTE} page it is copied from`),
    );
  });

  it('fails when the not-found page may be indexed', async () => {
    const indexable = notFoundPage({ noindex: '' });

    await writePage(NOT_FOUND_ROUTE, indexable);
    await writeToOutput('404.html', indexable);

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(expect.stringContaining('does not carry <meta name="robots"'));
  });

  it('fails when the design-system showcase may be indexed', async () => {
    await writePage(SHOWCASE_ROUTE, showcasePage({ noindex: '' }));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      `${SHOWCASE_ROUTE} does not carry <meta name="robots" content="noindex">`,
    );
  });

  it('fails when the address list offers the design-system showcase to a crawler', async () => {
    await writeToOutput(
      'sitemap.xml',
      sitemapOf([...publishedLocations(), `${SITE_ORIGIN}${SHOWCASE_ROUTE}`]),
    );

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining('the design-system showcase is never offered to a crawler'),
    );
  });

  it('fails once, not twice, when the release did not produce the showcase at all', async () => {
    await removePage(SHOWCASE_ROUTE);
    await writeToOutput('sitemap.xml', sitemapOf(publishedLocations()));

    const { failures } = await runSiteChecks(inputs);

    expect(failures.filter((failure) => failure.includes(SHOWCASE_ROUTE))).toEqual([
      `No page was produced for ${SHOWCASE_ROUTE}, which the catalog names`,
    ]);
  });

  it('fails when the address list omits a page the release produced', async () => {
    await writeToOutput(
      'sitemap.xml',
      sitemapOf([`${SITE_ORIGIN}/`, `${SITE_ORIGIN}${CATEGORY_ROUTE}`]),
    );

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`does not list ${SITE_ORIGIN}${PRODUCT_ROUTE}`),
    );
  });

  it('fails when the address list names a page the release did not produce', async () => {
    await writeToOutput(
      'sitemap.xml',
      sitemapOf([...publishedLocations(), `${SITE_ORIGIN}/product/9999`]),
    );

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(
        `lists ${SITE_ORIGIN}/product/9999, which the release did not produce`,
      ),
    );
  });

  it('fails when the address list offers the not-found page to a crawler', async () => {
    await writeToOutput(
      'sitemap.xml',
      sitemapOf([...publishedLocations(), `${SITE_ORIGIN}${NOT_FOUND_ROUTE}`]),
    );

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining('the not-found page is never offered to a crawler'),
    );
  });

  it('fails when robots.txt does not point at the address list', async () => {
    await writeToOutput('robots.txt', 'User-agent: *\nAllow: /\n');

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`does not carry "Sitemap: ${SITE_ORIGIN}/sitemap.xml"`),
    );
  });

  it('fails when a page kept the app shell title instead of writing its own', async () => {
    await writePage(CATEGORY_ROUTE, categoryPage({ title: SHELL_TITLE }));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`${CATEGORY_ROUTE} carries the app shell's title`),
    );
  });

  it('fails when a page has no title at all', async () => {
    await writePage(CATEGORY_ROUTE, categoryPage({ title: '' }));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(`${CATEGORY_ROUTE} has no <title>`);
  });

  it('reports two pages sharing a title without stopping the release', async () => {
    await writePage(CATEGORY_ROUTE, categoryPage({ title: 'Каталог — LioMebli' }));

    const { failures, notes } = await runSiteChecks(inputs);

    expect(failures).toEqual([]);
    expect(notes).toContainEqual(
      expect.stringContaining(`Duplicate title "Каталог — LioMebli" on ${CATALOG_ROUTE}`),
    );
  });

  it('fails when a page claims a canonical address that is not its own', async () => {
    await writePage(CATEGORY_ROUTE, categoryPage({ canonical: `${SITE_ORIGIN}/` }));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(
      expect.stringContaining(`${CATEGORY_ROUTE} names "${SITE_ORIGIN}/" as its canonical address`),
    );
  });

  it('fails when a page carries no canonical link', async () => {
    await writePage(CATEGORY_ROUTE, categoryPage({ canonical: '' }));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(`${CATEGORY_ROUTE} carries no <link rel="canonical">`);
  });

  it('fails naming the limit and the size when the initial scripts are too heavy', async () => {
    await writeFile(join(inputs.outputDir, 'main.js'), randomBytes(400_000));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(expect.stringContaining('above the limit of 250000 bytes'));
  });

  it('weighs the scripts gzipped, so 400 000 compressible bytes stay under the limit', async () => {
    await writeToOutput('main.js', 'console.log("main");'.repeat(20_000));

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toEqual([]);
  });

  it('refuses to judge a release built from a manifest it cannot read', async () => {
    await rm(inputs.manifestPath);

    await expect(runSiteChecks(inputs)).rejects.toThrow('build:manifest');
  });

  it('refuses to judge output it cannot read', async () => {
    await rm(inputs.outputDir, { recursive: true });

    await expect(runSiteChecks(inputs)).rejects.toThrow('npm run build');
  });

  it('refuses to judge titles it cannot compare against the app shell', async () => {
    await rm(inputs.shellIndexPath);

    await expect(runSiteChecks(inputs)).rejects.toThrow("cannot tell a page's own title");
  });

  it('names a script the catalog root loads but the release did not produce', async () => {
    await removeFromOutput('chunk.js');

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(expect.stringContaining('chunk.js'));
  });

  it('reports the rest of the release even when a script it loads is missing', async () => {
    await removeFromOutput('chunk.js');
    await removeFromOutput('robots.txt');

    const { failures } = await runSiteChecks(inputs);

    expect(failures).toContainEqual(expect.stringContaining('chunk.js'));
    expect(failures).toContainEqual(expect.stringContaining('robots.txt'));
  });

  async function givenAGoodRelease() {
    await writeManifest({ categories: CATEGORIES, products: PRODUCTS });
    await writeFile(inputs.shellIndexPath, page({ title: SHELL_TITLE }), 'utf8');

    await writePage(CATALOG_ROUTE, catalogPage());
    await writePage(NOT_FOUND_ROUTE, notFoundPage());
    await writePage(SHOWCASE_ROUTE, showcasePage());
    await writePage(CATEGORY_ROUTE, categoryPage());
    await writePage(PRODUCT_ROUTE, productPage());

    await writeToOutput('404.html', notFoundPage());
    await writeToOutput('sitemap.xml', sitemapOf(publishedLocations()));
    await writeToOutput(
      'robots.txt',
      `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
    );
    await writeToOutput('main.js', 'console.log("main");');
    await writeToOutput('chunk.js', 'console.log("chunk");');
  }

  async function writeManifest(manifest) {
    await writeFile(inputs.manifestPath, JSON.stringify(manifest), 'utf8');
  }

  async function writePage(route, html) {
    const pageDirectory = join(inputs.outputDir, ...segmentsOf(route));

    await mkdir(pageDirectory, { recursive: true });
    await writeFile(join(pageDirectory, 'index.html'), html, 'utf8');
  }

  async function removePage(route) {
    await rm(join(inputs.outputDir, ...segmentsOf(route)), { recursive: true });
  }

  async function writeToOutput(name, contents) {
    await mkdir(inputs.outputDir, { recursive: true });
    await writeFile(join(inputs.outputDir, name), contents, 'utf8');
  }

  async function removeFromOutput(name) {
    await rm(join(inputs.outputDir, name));
  }
});

function catalogPage() {
  return page({
    title: 'Каталог — LioMebli',
    canonical: `${SITE_ORIGIN}/`,
    head: MODULEPRELOAD,
    body: `<h1>Каталог</h1>${SCRIPT}`,
  });
}

function categoryPage({
  title = 'Ручки меблеві — LioMebli',
  canonical = `${SITE_ORIGIN}${CATEGORY_ROUTE}`,
} = {}) {
  return page({ title, canonical, body: '<h1>Ручки меблеві</h1>' });
}

function productPage({ name = ESCAPED_PRODUCT_NAME, availability = 'В наявності' } = {}) {
  return page({
    title: `${name} — LioMebli`,
    canonical: `${SITE_ORIGIN}${PRODUCT_ROUTE}`,
    body: `<h1>${name}</h1><p>${availability}</p>`,
  });
}

function showcasePage({ noindex = NOINDEX } = {}) {
  return page({
    title: 'Дизайн-система — LioMebli',
    canonical: `${SITE_ORIGIN}${SHOWCASE_ROUTE}`,
    head: noindex,
    body: '<h1>Дизайн-система</h1>',
  });
}

function notFoundPage({ noindex = NOINDEX } = {}) {
  return page({
    title: 'Сторінку не знайдено — LioMebli',
    canonical: `${SITE_ORIGIN}${NOT_FOUND_ROUTE}`,
    head: noindex,
    body: '<h1>Сторінку не знайдено</h1>',
  });
}

function page({ title, canonical, head = '', body = '' }) {
  const canonicalLink = canonical ? `<link rel="canonical" href="${canonical}">` : '';

  return (
    `<!DOCTYPE html><html lang="uk"><head><title>${title}</title>${head}${canonicalLink}</head>` +
    `<body>${body}</body></html>`
  );
}

describe('checkCommentBudget', () => {
  let directory;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'lm-comments-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  async function given(name, lines) {
    await writeFile(join(directory, name), lines.join('\n'), 'utf8');
  }

  it('passes a source tree with no comments and reports the count', async () => {
    await given('clean.ts', ['export const answer = 42;', '']);

    const { failures, notes } = await checkCommentBudget([directory], 0);

    expect(failures).toEqual([]);
    expect(notes[0]).toContain(': 0, ceiling 0');
  });

  it('fails naming the file and the count when the ceiling is passed', async () => {
    await given('noisy.ts', ['// why', 'export const answer = 42;', '']);

    const { failures } = await checkCommentBudget([directory], 0);

    expect(failures[0]).toContain('1 comment lines');
    expect(failures[0]).toContain('noisy.ts (1)');
  });

  it('counts every line of a block comment, not the block', async () => {
    await given('block.scss', ['/* one', '   two', '   three */', '.a { color: red; }', '']);

    const { notes } = await checkCommentBudget([directory], 99);

    expect(notes[0]).toContain(': 3, ceiling 99');
  });

  it('counts an HTML comment', async () => {
    await given('markup.html', ['<!-- why -->', '<p>text</p>', '']);

    const { notes } = await checkCommentBudget([directory], 99);

    expect(notes[0]).toContain(': 1, ceiling 99');
  });

  it('does not count comment syntax that a string or a regular expression owns', async () => {
    await given('code.ts', [
      "const url = 'https://liomebli.com.ua';",
      'const pattern = /\\/\\*|<!--/;',
      "const fixture = '/* not a comment */';",
      '',
    ]);

    const { notes } = await checkCommentBudget([directory], 0);

    expect(notes[0]).toContain(': 0, ceiling 0');
  });

  it('reads only the extensions the site is built from', async () => {
    await given('notes.md', ['<!-- prose is not code -->', '']);

    const { notes } = await checkCommentBudget([directory], 0);

    expect(notes[0]).toContain(': 0, ceiling 0');
  });
});

function publishedLocations() {
  return [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}${CATEGORY_ROUTE}`, `${SITE_ORIGIN}${PRODUCT_ROUTE}`];
}

function sitemapOf(locations) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locations.map((location) => `  <url><loc>${location}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
}

function segmentsOf(route) {
  return route === CATALOG_ROUTE ? [] : route.slice(1).split('/');
}
