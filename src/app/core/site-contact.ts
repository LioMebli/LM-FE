export const SITE_PHONE = '+380000000000';

export function telHref(phone: string | undefined): string {
  return `tel:${(phone ?? '').replace(/[^+\d]/g, '')}`;
}
