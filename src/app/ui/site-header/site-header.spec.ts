import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { giveJsdomTheDialogMethods } from '../../../testing/dialog';
import { NavDestination } from '../shell.types';
import { SiteHeader } from './site-header';

const DESTINATIONS: NavDestination[] = [
  { label: 'Каталог', link: '/' },
  { label: 'Доставка', link: '/dostavka' },
];

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;

  beforeAll(giveJsdomTheDialogMethods);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteHeader);
    fixture.componentRef.setInput('destinations', DESTINATIONS);
  });

  it('carries the shared wordmark rather than a second copy of it', async () => {
    await fixture.whenStable();

    expect(host().querySelector('app-brand-mark .brand')).not.toBeNull();
  });

  it('offers every destination it is given, in the menu and in the row alike', async () => {
    await fixture.whenStable();

    expect(labels('.header__link')).toEqual(['Каталог', 'Доставка']);
    expect(labels('.menu__link')).toEqual(['Каталог', 'Доставка']);
  });

  it('renders no destination it was not given', async () => {
    fixture.componentRef.setInput('destinations', []);
    await fixture.whenStable();

    expect(labels('.header__link')).toEqual([]);
    expect(labels('.menu__link')).toEqual([]);
  });

  it('dials the phone it is given, rather than scrolling to where a number is printed', async () => {
    fixture.componentRef.setInput('phone', '+380671234567');
    await fixture.whenStable();

    for (const selector of ['.header__call', '.menu__phone']) {
      expect(host().querySelector<HTMLAnchorElement>(selector)!.getAttribute('href')).toBe(
        'tel:+380671234567',
      );
    }
  });

  it('gives the call glyph a label, since it carries no text of its own', async () => {
    fixture.componentRef.setInput('phone', '+380671234567');
    await fixture.whenStable();

    expect(host().querySelector('.header__call')!.getAttribute('aria-label')).toBe(
      'Зателефонувати',
    );
  });

  it('renders no call control when it was given no phone', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.header__call')).toBeNull();
    expect(host().querySelector('.menu__phone')).toBeNull();
  });

  it('draws the count it is given, and draws a zero rather than hiding on one', async () => {
    fixture.componentRef.setInput('selectionCount', 3);
    await fixture.whenStable();

    const control = host().querySelector<HTMLButtonElement>('.header__selection')!;

    expect(control.textContent?.replace(/\s+/g, ' ').trim()).toBe('Підбірка 3');

    fixture.componentRef.setInput('selectionCount', 0);
    await fixture.whenStable();

    expect(
      host().querySelector('.header__selection')!.textContent?.replace(/\s+/g, ' ').trim(),
    ).toBe('Підбірка 0');
  });

  it('renders no selection control when it was given no count', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.header__selection')).toBeNull();
  });

  it('still shows the wordmark and the call when it is given no destination at all', async () => {
    fixture.componentRef.setInput('destinations', []);
    fixture.componentRef.setInput('phone', '+380671234567');
    await fixture.whenStable();

    expect(host().querySelector('app-brand-mark .brand')).not.toBeNull();
    expect(host().querySelector('.header__call')).not.toBeNull();
  });

  it('opens the menu as a modal and closes it by a labelled control', async () => {
    await fixture.whenStable();

    expect(menu().open).toBe(false);

    host().querySelector<HTMLButtonElement>('.header__opener')!.click();

    expect(menu().open).toBe(true);

    const close = host().querySelector<HTMLButtonElement>('.menu__close')!;

    expect(close.getAttribute('aria-label')).toBe('Закрити меню');

    close.click();

    expect(menu().open).toBe(false);
  });

  it('closes the menu when a destination in it is taken', async () => {
    await fixture.whenStable();

    host().querySelector<HTMLButtonElement>('.header__opener')!.click();
    host().querySelector<HTMLAnchorElement>('.menu__link')!.click();

    expect(menu().open).toBe(false);
  });

  it('reports the search rather than deciding where it goes', async () => {
    const asked: string[] = [];

    fixture.componentInstance.searched.subscribe((query) => asked.push(query));
    await fixture.whenStable();

    search('  ручка  ');

    expect(asked).toEqual(['ручка']);
  });

  it('offers the search in the bar and in the menu, and both report the same way', async () => {
    const asked: string[] = [];

    fixture.componentInstance.searched.subscribe((query) => asked.push(query));
    await fixture.whenStable();

    expect(host().querySelector('.header__search .header__field')).not.toBeNull();
    expect(host().querySelector('.menu__search .menu__field')).not.toBeNull();

    for (const [form, field_] of [
      ['.header__search form', '.header__field'],
      ['.menu__search', '.menu__field'],
    ]) {
      const field = host().querySelector<HTMLInputElement>(`${form} ${field_}`)!;

      field.value = 'ручка';
      host()
        .querySelector<HTMLFormElement>(form)!
        .dispatchEvent(new Event('submit', { cancelable: true }));
    }

    expect(asked).toEqual(['ручка', 'ручка']);
  });

  it('says nothing when the search is submitted empty', async () => {
    const asked: string[] = [];

    fixture.componentInstance.searched.subscribe((query) => asked.push(query));
    await fixture.whenStable();

    search('   ');

    expect(asked).toEqual([]);
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function menu(): HTMLDialogElement {
    return host().querySelector('dialog')!;
  }

  function labels(selector: string): string[] {
    return [...host().querySelectorAll(selector)].map((e) => e.textContent?.trim() ?? '');
  }

  function search(query: string): void {
    const field = host().querySelector<HTMLInputElement>('.header__field')!;

    field.value = query;
    host().querySelector<HTMLFormElement>('.header__search form')!.dispatchEvent(
      new Event('submit', { cancelable: true }),
    );
  }
});
