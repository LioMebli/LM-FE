import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CategoryCard } from './category-card';

const LONG_NAME = 'Напрямні прихованого монтажу з доводчиком';

describe('CategoryCard', () => {
  let fixture: ComponentFixture<CategoryCard>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryCard);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('name', 'Петлі');
    fixture.componentRef.setInput('link', '/category/2');
  });

  it('sends the whole card to the category, not just the name inside it', () => {
    fixture.detectChanges();

    const link = host.querySelector('a');

    expect(link?.getAttribute('href')).toBe('/category/2');
    expect(link?.querySelector('.card__name')).not.toBeNull();
  });

  it('renders a long name whole, because a truncated one cannot be chosen between', () => {
    fixture.componentRef.setInput('name', LONG_NAME);
    fixture.detectChanges();

    expect(host.querySelector('.card__name')?.textContent?.trim()).toBe(LONG_NAME);
  });

  it('draws nothing image-shaped, so a card without a photograph does not read as a failed one', () => {
    fixture.detectChanges();

    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.card__media')).toBeNull();
  });
});
