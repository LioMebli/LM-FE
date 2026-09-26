import { readFileSync, readdirSync } from 'node:fs';
import { join, sep } from 'node:path';

import { declaredTokenNames, referencedTokenNamesIn } from '../../testing/tokens-css';
import { UI_DIR, componentDirectories } from '../../testing/ui-components';

const SHELL_STYLESHEET = 'src/styles.scss';
const FEATURE_DIR = 'src/app/features';
const TAP_TARGET_LITERAL = /\b44px\b/g;

function stylesheetsUnder(dir: string): { path: string; source: string }[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.scss'))
    .map((entry) => {
      const path = join(entry.parentPath, entry.name);

      return { path, source: readFileSync(path, 'utf8') };
    });
}

function componentStylesheets(): { path: string; source: string }[] {
  return stylesheetsUnder(UI_DIR);
}

function everyAuthoredTemplate(): { path: string; source: string }[] {
  return [UI_DIR, FEATURE_DIR].flatMap((dir) =>
    readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => {
        const path = join(entry.parentPath, entry.name);

        return { path, source: readFileSync(path, 'utf8') };
      }),
  );
}

function everyAuthoredStylesheet(): { path: string; source: string }[] {
  return [
    ...componentStylesheets(),
    ...stylesheetsUnder(FEATURE_DIR),
    { path: SHELL_STYLESHEET, source: readFileSync(SHELL_STYLESHEET, 'utf8') },
  ];
}

const WIDE_LAYOUT_COMPONENTS = [
  'brand-mark',
  'call-band',
  'filter-sheet',
  'hero-panel',
  'material-picker',
  'process-steps',
  'project-card',
  'review-form',
  'service-row',
  'site-footer',
  'site-header',
  'sticky-action-bar',
  'testimonial-carousel',
  'text-field',
];

const KEYFRAMES_BLOCK = /@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g;

const INNERMOST_RULE = /[^{}]*\{[^{}]*\}/g;

const RUNS_AN_ANIMATION = /animation(?:-name)?\s*:/;

const HIDDEN_BY_A_BASE_RULE = /(?:opacity:\s*0(?![\d.])|visibility:\s*hidden)/;

const VIEW_PROGRESS_TIMELINE = /(?:animation-timeline:\s*view\(|view-timeline(?:-name|-axis|-inset)?\s*:)/;

const MAKES_A_SCROLL_CONTAINER = /overflow(?:-block|-inline|-x|-y)?:\s*(?:auto|scroll|hidden)/;

function baseRulesOf(source: string): string[] {
  return source.replace(KEYFRAMES_BLOCK, '').match(INNERMOST_RULE) ?? [];
}

function revealedOnlyByItsAnimation(source: string): boolean {
  return baseRulesOf(source).some(
    (rule) => RUNS_AN_ANIMATION.test(rule) && HIDDEN_BY_A_BASE_RULE.test(rule),
  );
}

function viewTimelineInsideItsOwnScroller(source: string): boolean {
  return VIEW_PROGRESS_TIMELINE.test(source) && MAKES_A_SCROLL_CONTAINER.test(source);
}

const VIEWPORT_WIDTH_UNIT = /[\d.]+vw\b/;

const LENGTH_IN_A_MEDIA_CONDITION = /@media[^{]*[\d.]+(?:px|rem|em|ch|vw|vh)\b/;

const CUSTOM_PROPERTY_IN_A_MEDIA_CONDITION = /@media[^{]*var\(/;

describe('the components’ design vocabulary', () => {
  it('reads a stylesheet for every component, so the checks below cannot pass on a short list', () => {
    expect(componentStylesheets()).toHaveLength(componentDirectories().length);
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

  it('reads the layout switch width from _breakpoints.scss rather than writing it', () => {
    const offenders = componentStylesheets()
      .filter(({ source }) => LENGTH_IN_A_MEDIA_CONDITION.test(source))
      .map(({ path }) => path);

    expect(offenders).toEqual([]);
  });

  it('catches a media condition that writes a width instead of reading it, in any unit', () => {
    for (const written of ['860px', '53.75rem', '48em', '100vw']) {
      expect(
        LENGTH_IN_A_MEDIA_CONDITION.test(`@media (min-width: ${written}) { .a { color: red } }`),
      ).toBe(true);
    }
  });

  it('leaves a length inside the block alone, and flags only the condition', () => {
    expect(
      LENGTH_IN_A_MEDIA_CONDITION.test(
        '@media (min-width: layout.$lm-layout-wide) { .a { border-width: 1px } }',
      ),
    ).toBe(false);
  });

  it('reaches the breakpoint through Sass, never through a custom property', () => {
    const offenders = componentStylesheets()
      .filter(({ source }) => CUSTOM_PROPERTY_IN_A_MEDIA_CONDITION.test(source))
      .map(({ path }) => path);

    expect(offenders).toEqual([]);
  });

  it('catches the edit that moves the breakpoint into tokens.css, which no browser would honour', () => {
    expect(
      CUSTOM_PROPERTY_IN_A_MEDIA_CONDITION.test('@media (min-width: var(--lm-layout-wide)) { .a { color: red } }'),
    ).toBe(true);
    expect(
      CUSTOM_PROPERTY_IN_A_MEDIA_CONDITION.test(
        '@media (min-width: bp.$lm-layout-wide) { .a { color: var(--lm-color-ink) } }',
      ),
    ).toBe(false);
  });

  it('leaves every animated element in its finished state when the animation is cancelled', () => {
    const strays = everyAuthoredStylesheet()
      .filter(({ source }) => revealedOnlyByItsAnimation(source))
      .map(
        ({ path }) =>
          `${path} hides an element outside @keyframes and animates it back into view, which prefers-reduced-motion never undoes`,
      );

    expect(strays).toEqual([]);
  });

  it('catches the hide-then-reveal shape, and leaves both halves alone when they are apart', () => {
    const reveal = '.panel { opacity: 0; animation-name: arrive; }';
    const keyframeOnly = '@keyframes arrive { from { opacity: 0 } }\n.panel { animation-name: arrive }';
    const unrelated = '.skip { opacity: 0 }\n.panel { animation-name: arrive }';

    expect(revealedOnlyByItsAnimation(reveal)).toBe(true);
    expect(revealedOnlyByItsAnimation(keyframeOnly)).toBe(false);
    expect(revealedOnlyByItsAnimation(unrelated)).toBe(false);
  });

  it('keeps the hiding utility and the templates that reach for it attached to each other', () => {
    const shell = readFileSync(SHELL_STYLESHEET, 'utf8');
    const rule = /\.visually-hidden\s*\{([^}]*)\}/.exec(shell)?.[1] ?? '';
    const reaching = everyAuthoredTemplate().filter(({ source }) =>
      /class="[^"]*\bvisually-hidden\b/.test(source),
    );

    expect(rule).toContain('position: absolute');
    expect(rule).toContain('clip-path: inset(50%)');
    expect(reaching.map(({ path }) => path)).not.toEqual([]);
  });

  it('keeps a view-progress animation out of anything that scrolls instead of the page', () => {
    const strays = everyAuthoredStylesheet()
      .filter(({ source }) => viewTimelineInsideItsOwnScroller(source))
      .map(
        ({ path }) =>
          `${path} reads a view-progress timeline inside a scroll container of its own, where the progress never advances; clip instead`,
      );

    expect(strays).toEqual([]);
  });

  it('needs both halves present, so neither regex can go blind and stay green', () => {
    const scroller = '.hero { overflow: hidden }';
    const clipped = '.hero { overflow: clip }';

    for (const timeline of [
      '.hero__image { animation-timeline: view() }',
      '.hero { view-timeline-name: --drift }',
    ]) {
      expect(viewTimelineInsideItsOwnScroller(`${scroller}${timeline}`)).toBe(true);
      expect(viewTimelineInsideItsOwnScroller(`${clipped}${timeline}`)).toBe(false);
    }

    expect(viewTimelineInsideItsOwnScroller(`${scroller}.hero__image { scale: 1.1 }`)).toBe(false);
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
