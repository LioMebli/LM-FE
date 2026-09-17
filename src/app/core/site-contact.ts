export const SITE_PHONE = '+380000000000';

export const SITE_CALL_HOURS = 'Пн–Сб, 9:00–19:00';

export function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? '').replace(/[^+\d]/g, '')}`;
}
