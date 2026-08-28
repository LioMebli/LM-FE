import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';
import { SiteFooter } from './ui/site-footer/site-footer';
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
    expect(host.querySelector('app-site-footer')).not.toBeNull();
  });

  it('holds one destination list and hands the same one to both header and footer', async () => {
    await fixture.whenStable();

    expect(header().destinations()).toEqual([{ label: 'Каталог', link: '/' }]);
    expect(footer().destinations()).toBe(header().destinations());
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

  function header(): SiteHeader {
    return fixture.debugElement.query((node) => node.componentInstance instanceof SiteHeader)
      .componentInstance as SiteHeader;
  }

  function footer(): SiteFooter {
    return fixture.debugElement.query((node) => node.componentInstance instanceof SiteFooter)
      .componentInstance as SiteFooter;
  }
});
