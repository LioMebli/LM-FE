import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavDestination } from '../site-header/site-header';
import { SiteFooter, SocialProfile } from './site-footer';

const DESTINATIONS: NavDestination[] = [
  { label: 'Каталог', link: '/' },
  { label: 'Доставка', link: '/dostavka' },
];

const SOCIALS: SocialProfile[] = [
  { network: 'Instagram', href: 'https://instagram.com/liomebli' },
  { network: 'Facebook', href: 'https://facebook.com/liomebli' },
];

describe('SiteFooter', () => {
  let fixture: ComponentFixture<SiteFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooter);
    fixture.componentRef.setInput('destinations', DESTINATIONS);
  });

  it('sends the wordmark home, and names it for a reader who cannot see it', async () => {
    await fixture.whenStable();

    const brand = host().querySelector<HTMLAnchorElement>('.footer__brand');

    expect(brand?.getAttribute('href')).toBe('/');
    expect(brand?.getAttribute('aria-label')).toBe('Lio Mebli — на головну');
  });

  it('offers every destination it is given', async () => {
    await fixture.whenStable();

    expect(labels('.footer__link')).toEqual(['Каталог', 'Доставка']);
  });

  it('renders no navigation at all when given no destination', async () => {
    fixture.componentRef.setInput('destinations', []);
    await fixture.whenStable();

    expect(host().querySelector('.footer__nav')).toBeNull();
  });

  it('turns the phone number into something a phone can dial', async () => {
    fixture.componentRef.setInput('phone', '+380671234567');
    await fixture.whenStable();

    const call = host().querySelector<HTMLAnchorElement>('.footer__phone');

    expect(call?.getAttribute('href')).toBe('tel:+380671234567');
    expect(call?.textContent?.trim()).toBe('+380671234567');
  });

  it('renders no phone block when no number is supplied', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.footer__phone')).toBeNull();
  });

  it('names the network on every social link, so an icon is never announced as nothing', async () => {
    fixture.componentRef.setInput('socials', SOCIALS);
    await fixture.whenStable();

    const links = [...host().querySelectorAll<HTMLAnchorElement>('.footer__social')];

    expect(links.map((link) => link.textContent?.trim())).toEqual(['Instagram', 'Facebook']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://instagram.com/liomebli',
      'https://facebook.com/liomebli',
    ]);
  });

  it('renders no social block when the list is empty', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.footer__socials')).toBeNull();
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function labels(selector: string): string[] {
    return [...host().querySelectorAll(selector)].map((e) => e.textContent?.trim() ?? '');
  }
});
