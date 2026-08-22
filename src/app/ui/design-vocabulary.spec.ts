import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { declaredTokenNames, stripComments } from '../../testing/tokens-css';

/**
 * Two vocabularies live under one `--lm-` prefix while the site is only half converted: the
 * design system extracted in LM-51 (`--lm-color-ink`, `--lm-space-md`, …) and the values LM-11
 * wrote for the app shell (`--lm-ink`, `--lm-surface`, `--lm-gutter`, …). Their names do not
 * collide, so a component that reaches for the wrong one compiles, renders, and is quietly a
 * few percent off — the class of mistake nobody catches by eye.
 *
 * The rule this guards is absolute for `src/app/ui/`: a component speaks tokens.css and nothing
 * else. It deliberately does not reach the showcase page, which names `--lm-gutter` on purpose
 * to cancel the shell's own padding, with the reason written where it does so.
 *
 * When LM-19 converts the shell and the second vocabulary is gone, this test has nothing left
 * to catch and should be deleted rather than kept as decoration.
 */
const UI_DIR = 'src/app/ui';

const REFERENCED_TOKEN = /var\(\s*(--lm-[a-z0-9-]+)/g;

function declaredTokenNameSet(): Set<string> {
  return new Set(declaredTokenNames());
}

function referencedTokenNames(source: string): string[] {
  return [...stripComments(source).matchAll(REFERENCED_TOKEN)].map(([, name]) => name);
}

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
    const declared = declaredTokenNameSet();
    const strays = componentStylesheets().flatMap(({ path, source }) =>
      referencedTokenNames(source)
        .filter((name) => !declared.has(name))
        .map((name) => `${path} reads ${name}, which tokens.css does not declare`),
    );

    expect(strays).toEqual([]);
  });

  it('catches a component that reached for the app shell’s vocabulary instead', () => {
    const declared = declaredTokenNameSet();
    const wrong = '.card { color: var(--lm-ink); background: var(--lm-surface); }';

    expect(referencedTokenNames(wrong).filter((name) => !declared.has(name))).toEqual([
      '--lm-ink',
      '--lm-surface',
    ]);
  });

  it('reads declarations and references only, never the names a comment mentions', () => {
    const commented = '/* not var(--lm-invented) */ .card { color: var(--lm-color-ink); }';

    expect(referencedTokenNames(commented)).toEqual(['--lm-color-ink']);
  });
});
