import { readFileSync } from 'node:fs';

/**
 * Reading `tokens.css`'s declared names, for `app/features/design-system/design-system-page.spec.ts`,
 * which checks that the showcase lists exactly the names the stylesheet declares.
 *
 * It shared this parser with `app/ui/design-vocabulary.spec.ts` until LM-19 deleted that test
 * along with the second vocabulary it guarded. The sharing was worth keeping while both existed:
 * they had a parser each — same path, same two expressions, differing only in Set versus array —
 * so changing the stylesheet's path or comment style moved two files, and the one that was missed
 * kept passing on input it no longer read correctly.
 *
 * Comments are stripped first because `tokens.css` explains each group in prose that names
 * tokens, so a parser reading the whole file counts sentences as declarations.
 */
export const TOKENS_PATH = 'src/styles/tokens.css';

const COMMENT = /\/\*[\s\S]*?\*\//g;
const DECLARED_TOKEN = /(--lm-[a-z0-9-]+)\s*:/g;

function stripComments(source: string): string {
  return source.replace(COMMENT, '');
}

export function declaredTokenNamesIn(source: string): string[] {
  return [...stripComments(source).matchAll(DECLARED_TOKEN)].map(([, name]) => name);
}

export function declaredTokenNames(): string[] {
  return declaredTokenNamesIn(readFileSync(TOKENS_PATH, 'utf8'));
}
