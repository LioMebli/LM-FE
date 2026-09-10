import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { declaredTokenNames, declaredTokenNamesIn } from '../../../testing/tokens-css';
import { SHOWN_BY_THE_SHELL, componentDirectories } from '../../../testing/ui-components';
import { DesignSystemPage, SHOWCASE_TOKEN_NAMES } from './design-system-page';

describe('DesignSystemPage', () => {
  let fixture: ComponentFixture<DesignSystemPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignSystemPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DesignSystemPage);
    await fixture.whenStable();
  });

  it('shows every token the stylesheet declares, and no name the stylesheet does not', () => {
    expect([...SHOWCASE_TOKEN_NAMES].sort()).toEqual(declaredTokenNames().sort());
  });

  it('renders each token name it lists', () => {
    const rendered = fixture.nativeElement.textContent as string;

    for (const name of SHOWCASE_TOKEN_NAMES) {
      expect(rendered).toContain(name);
    }
  });

  it('keeps the page out of search', () => {
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex',
    );
  });

  it('renders every component there is, as the real one rather than a copy of its markup', () => {
    const host = fixture.nativeElement as HTMLElement;
    const missing = componentDirectories()
      .filter((name) => !SHOWN_BY_THE_SHELL.includes(name))
      .filter((name) => host.querySelector(`app-${name}`) === null);

    expect(missing).toEqual([]);
  });
});

describe('the token list guard', () => {
  it('fails when the page lists a name the stylesheet does not declare', () => {
    const stale = [...SHOWCASE_TOKEN_NAMES, '--lm-color-accent'];

    expect(stale.sort()).not.toEqual(declaredTokenNames().sort());
  });

  it('fails when the stylesheet declares a name the page does not list', () => {
    const incomplete = [...SHOWCASE_TOKEN_NAMES].slice(1);

    expect(incomplete.sort()).not.toEqual(declaredTokenNames().sort());
  });

  it('reads declarations only, never the names its comments mention', () => {
    const commentOnly = '/* --lm-color-invented: red; */\n:root { --lm-color-real: blue; }';

    expect(declaredTokenNamesIn(commentOnly)).toEqual(['--lm-color-real']);
  });
});
