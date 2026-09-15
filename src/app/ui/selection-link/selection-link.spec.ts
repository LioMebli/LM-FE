import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SelectionLink } from './selection-link';

describe('SelectionLink', () => {
  let fixture: ComponentFixture<SelectionLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionLink],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionLink);
  });

  it('names the count and leads where it was told', async () => {
    fixture.componentRef.setInput('count', 3);
    fixture.componentRef.setInput('link', '/pidbirka');
    await fixture.whenStable();

    const control = host().querySelector<HTMLAnchorElement>('.selection')!;

    expect(control.getAttribute('href')).toBe('/pidbirka');
    expect(control.textContent?.replace(/\s+/g, ' ').trim()).toBe('Підбірка 3');
  });

  it('renders an empty selection rather than hiding it, since zero is a state and not an absence', async () => {
    fixture.componentRef.setInput('count', 0);
    fixture.componentRef.setInput('link', '/pidbirka');
    await fixture.whenStable();

    expect(host().querySelector('.selection__count')?.textContent?.trim()).toBe('0');
  });

  it('renders nothing when it was given a count but nowhere to go', async () => {
    fixture.componentRef.setInput('count', 3);
    await fixture.whenStable();

    expect(host().querySelector('.selection')).toBeNull();
  });

  it('renders nothing when it was given somewhere to go but no count', async () => {
    fixture.componentRef.setInput('link', '/pidbirka');
    await fixture.whenStable();

    expect(host().querySelector('.selection')).toBeNull();
  });

  it('renders nothing when it was given neither', async () => {
    await fixture.whenStable();

    expect(host().querySelector('.selection')).toBeNull();
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
