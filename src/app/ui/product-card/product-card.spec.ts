import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductCard } from './product-card';

describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('name', 'Змішувач кухонний');
    fixture.componentRef.setInput('price', 980);
    fixture.componentRef.setInput('availability', 'IN_STOCK');
    fixture.componentRef.setInput('link', '/product/1042');
  });

  it('groups the thousands and names the currency', async () => {
    fixture.componentRef.setInput('price', 104800);
    await fixture.whenStable();

    // uk-UA groups with a non-breaking space, which is why this compares against  .
    expect(price()).toBe('104 800 ₴');
  });

  it('shows a whole-hryvnia price with no fraction', async () => {
    await fixture.whenStable();

    expect(price()).toBe('980 ₴');
  });

  it('badges a product with several variants', async () => {
    fixture.componentRef.setInput('variantCount', 6);
    await fixture.whenStable();

    expect(host().querySelector('app-variant-badge')?.textContent).toContain('6');
  });

  it('draws no badge for a product with one variant, because the count would say nothing', async () => {
    await fixture.whenStable();

    expect(host().querySelector('app-variant-badge')).toBeNull();
  });

  it('draws an empty frame while the product has no photograph', async () => {
    await fixture.whenStable();

    expect(host().querySelector('img')).toBeNull();
    expect(host().querySelector('.card__media-empty')).not.toBeNull();
  });

  it('draws the photograph once the product has one', async () => {
    fixture.componentRef.setInput('image', {
      src: '/media/1042-card.webp',
      alt: 'Змішувач кухонний',
      width: 500,
      height: 342,
    });
    await fixture.whenStable();

    const image = host().querySelector('img');

    expect(image?.getAttribute('alt')).toBe('Змішувач кухонний');
    expect(host().querySelector('.card__media-empty')).toBeNull();
  });

  it('reports an add to the selection rather than performing one', async () => {
    const added: number[] = [];

    fixture.componentInstance.addedToSelection.subscribe(() => added.push(1));
    await fixture.whenStable();

    host().querySelector<HTMLButtonElement>('.card__add')?.click();

    expect(added).toHaveLength(1);
  });

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function price(): string {
    return host().querySelector('.card__price')?.textContent?.trim() ?? '';
  }
});
