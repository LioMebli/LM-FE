import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { App } from './app';
import { environment } from '../environments/environment';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creates the app', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('probes the API host taken from the environment', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    click(fixture.nativeElement as HTMLElement);

    const request = httpMock.expectOne(`${environment.apiBaseUrl}/api/v1/health`);
    expect(request.request.method).toBe('GET');
    request.flush({}, { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();
    expect(text(fixture.nativeElement as HTMLElement)).toContain('HTTP 404');
  });

  it('reports a blocked request when the browser returns no status', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    click(fixture.nativeElement as HTMLElement);

    httpMock
      .expectOne(`${environment.apiBaseUrl}/api/v1/health`)
      .error(new ProgressEvent('error'), { status: 0 });

    await fixture.whenStable();
    expect(text(fixture.nativeElement as HTMLElement)).toContain('CORS');
  });
});

function click(host: HTMLElement): void {
  host.querySelector('button')?.dispatchEvent(new Event('click'));
}

function text(host: HTMLElement): string {
  return host.textContent ?? '';
}
