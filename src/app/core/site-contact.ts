export const SITE_PHONE = '+38 (000) 000-00-00';

export const SITE_CALL_HOURS = 'Пн–Сб, 9:00–19:00';

export const SITE_ADDRESS = 'вул. Сумська 10, Харків';

export const SITE_EMAIL = 'info@liomebli.ua';

export function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? '').replace(/[^+\d]/g, '')}`;
}
