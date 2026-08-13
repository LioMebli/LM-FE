import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PRODUCTION_SITE_ORIGIN } from './site-config.mjs';
import { renderEnvironment, writeEnvironment } from './site-environment.mjs';

const API_BASE_URL = 'https://api-dev.liomebli.com.ua';
const SITE_ORIGIN = 'https://dev.liomebli.com.ua';

describe('renderEnvironment', () => {
  it('carries both addresses it was given', () => {
    const source = renderEnvironment({ apiBaseUrl: API_BASE_URL, siteOrigin: SITE_ORIGIN });

    expect(source).toContain(`apiBaseUrl: "${API_BASE_URL}"`);
    expect(source).toContain(`siteOrigin: "${SITE_ORIGIN}"`);
  });

  it('marks a build as production only when its origin is the public one', () => {
    expect(
      renderEnvironment({ apiBaseUrl: API_BASE_URL, siteOrigin: PRODUCTION_SITE_ORIGIN }),
    ).toContain('production: true');
    expect(renderEnvironment({ apiBaseUrl: API_BASE_URL, siteOrigin: SITE_ORIGIN })).toContain(
      'production: false',
    );
  });

  it('says the file is generated, so nobody edits it and loses the edit', () => {
    const source = renderEnvironment({ apiBaseUrl: API_BASE_URL, siteOrigin: SITE_ORIGIN });

    expect(source.split('\n')[0]).toContain('tools/site-environment.mjs');
  });

  it('keeps an address inside its string literal, whatever the address contains', () => {
    const hostile = 'http://localhost:8080/\'; export const stolen = 1; //';

    const source = renderEnvironment({ apiBaseUrl: hostile, siteOrigin: SITE_ORIGIN });

    expect(source.match(/^export const /gm)).toHaveLength(1);
    expect(source).toContain(`apiBaseUrl: ${JSON.stringify(hostile)},`);
  });
});

describe('writeEnvironment', () => {
  let directory;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'lm-environment-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('creates the file and the directory holding it, since neither is committed', async () => {
    const environmentPath = join(directory, 'environments', 'environment.ts');

    await writeEnvironment({ environmentPath, apiBaseUrl: API_BASE_URL, siteOrigin: SITE_ORIGIN });

    expect(await readFile(environmentPath, 'utf8')).toBe(
      renderEnvironment({ apiBaseUrl: API_BASE_URL, siteOrigin: SITE_ORIGIN }),
    );
  });

  it('replaces what the previous build wrote, rather than adding to it', async () => {
    const environmentPath = join(directory, 'environments', 'environment.ts');

    await writeEnvironment({
      environmentPath,
      apiBaseUrl: 'http://localhost:8080',
      siteOrigin: PRODUCTION_SITE_ORIGIN,
    });
    await writeEnvironment({ environmentPath, apiBaseUrl: API_BASE_URL, siteOrigin: SITE_ORIGIN });

    const written = await readFile(environmentPath, 'utf8');
    expect(written).not.toContain('production: true');
    expect(written).toContain(`apiBaseUrl: "${API_BASE_URL}"`);
  });
});
