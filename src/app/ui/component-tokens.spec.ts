import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { declaredTokenNames, referencedTokenNamesIn } from '../../testing/tokens-css';

/**
 * A component under `src/app/ui/` names only values `tokens.css` declares.
 *
 * An undeclared name is silent in every other instrument: `var(--lm-colour-ink)` compiles, the
 * build succeeds, and the property falls back to its initial value — so the component renders,
 * slightly wrong, and no test, no linter and no release check says anything. That is the whole
 * subject here, and it is why `docs/ARCHITECTURE.md` §4.1 gives this file as the first reason
 * new presentational components go in `ui/` rather than a `layout/` of their own.
 *
 * It replaces `design-vocabulary.spec.ts`, which LM-19 deleted, and it is deliberately narrower.
 * That file did two jobs: this one, and catching a component that reached for the second
 * vocabulary LM-11 declared beside the design system. The second job ended when LM-19 deleted
 * that vocabulary; the first never depended on it.
 */
const UI_DIR = 'src/app/ui';

function componentStylesheets(): { path: string; source: string }[] {
  return readdirSync(UI_DIR, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.scss'))
    .map((entry) => {
      const path = join(entry.parentPath, entry.name);

      return { path, source: readFileSync(path, 'utf8') };
    });
}

describe('the components’ design vocabulary', () => {
  it('finds the stylesheets it is meant to be reading', () => {
    expect(componentStylesheets().length).toBeGreaterThanOrEqual(9);
  });

  it('names only values that tokens.css declares', () => {
    const declared = new Set(declaredTokenNames());
    const strays = componentStylesheets().flatMap(({ path, source }) =>
      referencedTokenNamesIn(source)
        .filter((name) => !declared.has(name))
        .map((name) => `${path} reads ${name}, which tokens.css does not declare`),
    );

    expect(strays).toEqual([]);
  });

  it('catches a stylesheet that names a token nobody declared', () => {
    const declared = new Set(declaredTokenNames());
    const typo = '.card { color: var(--lm-colour-ink); }';

    expect(referencedTokenNamesIn(typo).filter((name) => !declared.has(name))).toEqual([
      '--lm-colour-ink',
    ]);
  });

  it('reads references only, never the names a comment mentions', () => {
    const commented = '/* not var(--lm-invented) */ .card { color: var(--lm-color-ink); }';

    expect(referencedTokenNamesIn(commented)).toEqual(['--lm-color-ink']);
  });
});
