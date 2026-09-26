import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  let fixture: ComponentFixture<ProjectCard>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectCard);
    host = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('name', 'Кухня «Anthracite Minimal»');
    fixture.componentRef.setInput('lede', 'Матові фасади та інтегроване освітлення.');
  });

  it('names the project and says one thing about it', () => {
    fixture.detectChanges();

    expect(host.querySelector('.project__name')?.textContent?.trim()).toBe(
      'Кухня «Anthracite Minimal»',
    );
    expect(host.querySelector('.project__lede')?.textContent?.trim()).toBe(
      'Матові фасади та інтегроване освітлення.',
    );
  });

  it('keeps its empty picture frame when there is no photograph, so the row stays even', () => {
    fixture.detectChanges();

    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.project__media')).not.toBeNull();
  });

  it('draws the photograph once it is given one, with the alternative text as passed', () => {
    fixture.componentRef.setInput('image', {
      src: '/images/project-anthracite.webp',
      alt: 'Кухня Anthracite Minimal',
    });
    fixture.detectChanges();

    const image = host.querySelector('img');

    expect(image?.getAttribute('alt')).toBe('Кухня Anthracite Minimal');
    expect(image?.getAttribute('src')).toContain('/images/project-anthracite.webp');
  });

  it('leads nowhere, because the catalog route it would lead to does not exist yet', () => {
    fixture.detectChanges();

    expect(host.querySelector('a')).toBeNull();
  });
});
