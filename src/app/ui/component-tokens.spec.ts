import { readFileSync, readdirSync } from 'node:fs';
import { join, sep } from 'node:path';

import { declaredTokenNames, referencedTokenNamesIn } from '../../testing/tokens-css';

const UI_DIR = 'src/app/ui';
const SHELL_STYLESHEET = 'src/styles.scss';
const TAP_TARGET_LITERAL = /\b44px\b/g;

function componentStylesheets(): { path: string; source: string }[] {
  return readdirSync(UI_DIR, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.scss'))
    .map((entry) => {
      const path = join(entry.parentPath, entry.name);

      return { path, source: readFileSync(path, 'utf8') };
    });
}

function everyAuthoredStylesheet(): { path: string; source: string }[] {
  return [
    ...componentStylesheets(),
    { path: SHELL_STYLESHEET, source: readFileSync(SHELL_STYLESHEET, 'utf8') },
  ];
}

const WIDE_LAYOUT_COMPONENTS = ['filter-sheet', 'site-footer', 'site-header', 'sticky-action-bar'];

const VIEWPORT_WIDTH_UNIT = /[\d.]+vw\b/;

describe('the components’ design vocabulary', () => {
  it('finds the stylesheets it is meant to be reading', () => {
    expect(componentStylesheets().length).toBeGreaterThanOrEqual(14);
  });

  it('gives a second layout only to the components that were decided to have one', () => {
    const wide = componentStylesheets()
      .filter(({ source }) => /@media[^{]*min-width/.test(source))
      .map(({ path }) => path.split(sep).at(-2))
      .sort();

    expect(wide).toEqual(WIDE_LAYOUT_COMPONENTS);
  });

  it('sizes nothing against the viewport width, which counts the scrollbar gutter', () => {
    const offenders = componentStylesheets()
      .filter(({ source }) => VIEWPORT_WIDTH_UNIT.test(source))
      .map(({ path }) => path);

    expect(offenders).toEqual([]);
  });

  it('catches the full-bleed idiom, and leaves the hover veil alone', () => {
    expect(VIEWPORT_WIDTH_UNIT.test('.hero { margin-inline: calc(50% - 50vw); }')).toBe(true);
    expect(VIEWPORT_WIDTH_UNIT.test('box-shadow: inset 0 0 0 100vmax var(--lm-hover-veil);')).toBe(
      false,
    );
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

  it('lets nobody write the tap-target floor as a number again', () => {
    const strays = everyAuthoredStylesheet().flatMap(({ path, source }) =>
      (source.match(TAP_TARGET_LITERAL) ?? []).map(
        () => `${path} writes 44px, which --lm-tap-target-min declares`,
      ),
    );

    expect(strays).toEqual([]);
  });

  it('catches a stylesheet that writes the floor instead of reading it', () => {
    const relapse = '.thing { min-block-size: 44px; }';

    expect(relapse.match(TAP_TARGET_LITERAL)).toEqual(['44px']);
  });

  it('reads references only, never the names a comment mentions', () => {
    const commented = '/* not var(--lm-invented) */ .card { color: var(--lm-color-ink); }';

    expect(referencedTokenNamesIn(commented)).toEqual(['--lm-color-ink']);
  });
});
