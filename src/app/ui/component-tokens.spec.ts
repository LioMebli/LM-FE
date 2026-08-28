import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { declaredTokenNames, referencedTokenNamesIn } from '../../testing/tokens-css';

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
