import { describe, expect, it } from 'vitest';

import {
  DEFAULT_API_BASE_URL,
  DEFAULT_SITE_ORIGIN,
  PRODUCTION_SITE_ORIGIN,
  isProductionOrigin,
  resolveApiBaseUrl,
  resolveSiteOrigin,
} from './site-config.mjs';

describe('resolveApiBaseUrl', () => {
  it('addresses a local backend when nothing is supplied', () => {
    expect(resolveApiBaseUrl({})).toBe(DEFAULT_API_BASE_URL);
    expect(DEFAULT_API_BASE_URL).toBe('http://localhost:8080');
  });

  it('takes the supplied address', () => {
    expect(resolveApiBaseUrl({ LM_API_BASE_URL: 'https://api-dev.liomebli.com.ua' })).toBe(
      'https://api-dev.liomebli.com.ua',
    );
  });

  it('falls back when the variable is present but empty, as an undefined CI variable arrives', () => {
    expect(resolveApiBaseUrl({ LM_API_BASE_URL: '' })).toBe(DEFAULT_API_BASE_URL);
  });
});

describe('resolveSiteOrigin', () => {
  it('addresses the dev server when nothing is supplied', () => {
    expect(resolveSiteOrigin({})).toBe(DEFAULT_SITE_ORIGIN);
    expect(DEFAULT_SITE_ORIGIN).toBe('http://localhost:4200');
  });

  it('takes the supplied origin', () => {
    expect(resolveSiteOrigin({ LM_SITE_ORIGIN: 'https://dev.liomebli.com.ua' })).toBe(
      'https://dev.liomebli.com.ua',
    );
  });

  it('falls back when the variable is present but empty', () => {
    expect(resolveSiteOrigin({ LM_SITE_ORIGIN: '' })).toBe(DEFAULT_SITE_ORIGIN);
  });
});

describe('isProductionOrigin', () => {
  it('recognises the one origin the public site is served from', () => {
    expect(isProductionOrigin(PRODUCTION_SITE_ORIGIN)).toBe(true);
    expect(PRODUCTION_SITE_ORIGIN).toBe('https://liomebli.com.ua');
  });

  it('closes every other origin, including ones nobody has thought of yet', () => {
    expect(isProductionOrigin('https://dev.liomebli.com.ua')).toBe(false);
    expect(isProductionOrigin('https://lm-fe.pages.dev')).toBe(false);
    expect(isProductionOrigin(DEFAULT_SITE_ORIGIN)).toBe(false);
    expect(isProductionOrigin(resolveSiteOrigin({}))).toBe(false);
  });

  it('closes an origin that only resembles production', () => {
    expect(isProductionOrigin('http://liomebli.com.ua')).toBe(false);
    expect(isProductionOrigin('https://liomebli.com.ua/')).toBe(false);
    expect(isProductionOrigin('https://www.liomebli.com.ua')).toBe(false);
  });
});
