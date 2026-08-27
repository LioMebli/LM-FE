import { readFileSync } from 'node:fs';

/**
 * Parsing `tokens.css` for the two tests that guard it: `app/ui/component-tokens.spec.ts` checks
 * that no component names a value the stylesheet does not declare, and
 * `app/features/design-system/design-system-page.spec.ts` checks that the showcase lists exactly
 * the names it does.
 *
 * They had a parser each until the two were merged here — same path, same expressions, differing
 * only in Set versus array — so changing the stylesheet's path or its comment style moved two
 * files, and the one that was missed kept passing on input it no longer read correctly. That is
 * the failure both tests exist to prevent, which is why the parser has one home.
 *
 * Comments are stripped first because `tokens.css` explains each group in prose that names
 * tokens, so a parser reading the whole file counts sentences as declarations.
 */
const TOKENS_PATH = 'src/styles/tokens.css';

const COMMENT = /\/\*[\s\S]*?\*\//g;
const DECLARED_TOKEN = /(--lm-[a-z0-9-]+)\s*:/g;
const REFERENCED_TOKEN = /var\(\s*(--lm-[a-z0-9-]+)/g;

function stripComments(source: string): string {
  return source.replace(COMMENT, '');
}

export function declaredTokenNamesIn(source: string): string[] {
  return [...stripComments(source).matchAll(DECLARED_TOKEN)].map(([, name]) => name);
}

export function declaredTokenNames(): string[] {
  return declaredTokenNamesIn(readFileSync(TOKENS_PATH, 'utf8'));
}

export function referencedTokenNamesIn(source: string): string[] {
  return [...stripComments(source).matchAll(REFERENCED_TOKEN)].map(([, name]) => name);
}
