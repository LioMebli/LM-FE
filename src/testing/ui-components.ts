import { readdirSync } from 'node:fs';

export const UI_DIR = 'src/app/ui';

export const SHOWN_BY_THE_SHELL = ['brand-mark', 'site-header'];

export function componentDirectories(): string[] {
  return readdirSync(UI_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
