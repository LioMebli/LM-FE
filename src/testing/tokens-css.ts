import { readFileSync } from 'node:fs';

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
