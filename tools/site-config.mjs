export const PRODUCTION_SITE_ORIGIN = 'https://liomebli.com.ua';
export const DEFAULT_API_BASE_URL = 'http://localhost:8080';
export const DEFAULT_SITE_ORIGIN = 'http://localhost:4200';

export function resolveApiBaseUrl(env = process.env) {
  return supplied(env.LM_API_BASE_URL) ?? DEFAULT_API_BASE_URL;
}

export function resolveSiteOrigin(env = process.env) {
  return supplied(env.LM_SITE_ORIGIN) ?? DEFAULT_SITE_ORIGIN;
}

export function isProductionOrigin(origin) {
  return origin === PRODUCTION_SITE_ORIGIN;
}

// A CI runner sets these from repository variables, and an undefined variable expands to an
// empty string rather than to nothing — `env: LM_API_BASE_URL: ${{ vars.LM_API_BASE_URL }}`
// with no such variable arrives here as ''. Without this, `??` would hand that empty address
// to every stage downstream.
function supplied(value) {
  return value === undefined || value === '' ? undefined : value;
}
