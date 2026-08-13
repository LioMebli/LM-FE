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

// A Dockerfile ARG declared without a value reaches the build as an empty string, not as an
// absent variable, so `??` alone would hand an empty address to every stage downstream.
function supplied(value) {
  return value === undefined || value === '' ? undefined : value;
}
