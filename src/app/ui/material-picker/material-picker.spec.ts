import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Material, MaterialPicker } from './material-picker';

const MATERIALS: Material[] = [
  { name: 'Натуральний дуб', summary: 'Шпон із живою текстурою.', detail: 'Шпон із живою текстурою, олійне покриття, тепла матова поверхня.' },
  { name: 'Камінь і кварц', summary: 'Стійкі поверхні.', detail: 'Стійкі поверхні, що не бояться гарячого посуду й вологи.' },
];

describe('MaterialPicker', () => {
  let fixture: ComponentFixture<MaterialPicker>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialPicker);
    host = fixture.nativeElement as HTMLElement;
  });

  it('says the wide line where there is one, and the long one where there is not', async () => {
    fixture.componentRef.setInput('materials', [
      { ...MATERIALS[0], wideDetail: 'Шпон із живою текстурою, олійне покриття.' },
      MATERIALS[1],
    ]);
    await fixture.whenStable();

    const wide = [...host.querySelectorAll('.material__detail--wide')].map((node) =>
      node.textContent?.trim(),
    );

    expect(wide).toEqual([
      'Шпон із живою текстурою, олійне покриття.',
      'Стійкі поверхні, що не бояться гарячого посуду й вологи.',
    ]);
  });

  it('offers one control per material and marks the chosen one', async () => {
    fixture.componentRef.setInput('materials', MATERIALS);
    await fixture.whenStable();

    const controls = host.querySelectorAll('.material');

    expect(controls).toHaveLength(2);
    expect(controls[0].getAttribute('aria-pressed')).toBe('false');
    expect(controls[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('shows more of the chosen material and less of the others', async () => {
    fixture.componentRef.setInput('materials', MATERIALS);
    await fixture.whenStable();

    const details = () =>
      [...host.querySelectorAll('.material__detail--picked')].map((node) => node.textContent?.trim());

    expect(details()).toEqual([MATERIALS[0].summary, MATERIALS[1].detail]);

    host.querySelectorAll<HTMLButtonElement>('.material')[0].click();
    await fixture.whenStable();

    expect(details()).toEqual([MATERIALS[0].detail, MATERIALS[1].summary]);
  });

  it('renders nothing at all when it was given no materials', async () => {
    fixture.componentRef.setInput('materials', []);
    await fixture.whenStable();

    expect(host.querySelectorAll('.material')).toHaveLength(0);
    expect(host.querySelector('.materials')).not.toBeNull();
  });

  it('draws an empty frame rather than an image with no source', async () => {
    fixture.componentRef.setInput('materials', [MATERIALS[0]]);
    await fixture.whenStable();

    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.material__media')).not.toBeNull();
  });
});
