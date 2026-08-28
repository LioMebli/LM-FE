import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';
import { SiteHeader } from './ui/site-header/site-header';

@Component({ template: '' })
class BlankRoute {}

describe('App', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: BlankRoute },
          { path: 'design-system', component: BlankRoute },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
  });

  it('creates the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('wraps every route in the shell', async () => {
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('app-site-header')).not.toBeNull();
    expect(host.querySelector('main router-outlet')).not.toBeNull();
  });

  it('holds one destination list and hands it to the header', async () => {
    await fixture.whenStable();

    const header = fixture.debugElement.children.find((c) => c.componentInstance instanceof SiteHeader);

    expect((header?.componentInstance as SiteHeader).destinations()).toEqual([
      { label: 'Каталог', link: '/' },
    ]);
  });

  it('turns a search into a catalog address carrying the query', async () => {
    const router = TestBed.inject(Router);

    await router.navigate(['/design-system']);
    await fixture.whenStable();

    header().searched.emit('ручка');
    await fixture.whenStable();

    expect(router.url).toBe('/?q=%D1%80%D1%83%D1%87%D0%BA%D0%B0');
    expect(decodeURIComponent(router.url)).toBe('/?q=ручка');
  });

  it('leaves the address alone when the header reports nothing', async () => {
    const router = TestBed.inject(Router);

    await router.navigate(['/design-system']);
    await fixture.whenStable();

    expect(router.url).toBe('/design-system');
  });

  function header(): SiteHeader {
    return fixture.debugElement.query((node) => node.componentInstance instanceof SiteHeader)
      .componentInstance as SiteHeader;
  }
});
