import { Component, inject } from '@angular/core';

import { PageMetadata } from '../../core/seo/page-metadata';
import { SITE_PHONE } from '../../core/site-contact';
import { CallBand } from '../../ui/call-band/call-band';
import { HeroPanel } from '../../ui/hero-panel/hero-panel';
import { Material, MaterialPicker } from '../../ui/material-picker/material-picker';
import { Photograph } from '../../ui/media.types';
import { ProcessStep, ProcessSteps } from '../../ui/process-steps/process-steps';
import { ProjectCard } from '../../ui/project-card/project-card';
import { ReviewForm } from '../../ui/review-form/review-form';
import { Service, ServiceRow } from '../../ui/service-row/service-row';
import { Testimonial, TestimonialCarousel } from '../../ui/testimonial-carousel/testimonial-carousel';

const HEADING = 'Lio Mebli';

const LEDE = 'Створюємо простір, де кожен сантиметр має значення.';

const DESCRIPTION =
  'Проєктуємо, виготовляємо й монтуємо меблі на замовлення. Безкоштовний замір і розрахунок.';

const HERO: Photograph = {
  src: 'images/hero-kitchen.webp',
  alt: 'Кухня, виготовлена Lio Mebli',
};

const SERVICES: readonly Service[] = [
  { name: 'Проєктування', detail: 'Індивідуальні рішення під ваш простір.' },
  { name: 'Виготовлення', detail: 'Чесні матеріали й власне виробництво.' },
  { name: 'Монтаж', detail: 'Привозимо, збираємо, прибираємо за собою.' },
];

const CALL_HEADING = 'Один дзвінок — і ми порахуємо вашу кухню';

const CALL_LEDE = 'Безкоштовно підберемо планування й матеріали, назвемо ціну та строк.';

const CALL_HOURS = 'Пн–Сб, 9:00–19:00';

interface Project {
  name: string;
  lede: string;
  image: Photograph;
}

const PROJECTS: readonly Project[] = [
  {
    name: 'Кухня «Anthracite Minimal»',
    lede: 'Матові фасади та інтегроване освітлення.',
    image: { src: 'images/project-anthracite.jpg', alt: 'Кухня з матовими фасадами' },
  },
  {
    name: 'Вітальня «Warm Wood»',
    lede: 'Поєднання дуба та мʼяких ліній.',
    image: { src: 'images/project-warm-wood.jpg', alt: 'Вітальня з дубовими фасадами' },
  },
];

const MATERIALS: readonly Material[] = [
  {
    name: 'Натуральний дуб',
    summary: 'Шпон із живою текстурою.',
    detail: 'Шпон із живою текстурою, олійне покриття, тепла матова поверхня.',
    image: { src: 'images/material-oak.jpg', alt: 'Дубова панель' },
  },
  {
    name: 'Камінь і кварц',
    summary: 'Стійкі поверхні.',
    detail: 'Стійкі поверхні, що не бояться гарячого посуду й вологи.',
    image: { src: 'images/material-stone.jpg', alt: 'Камінна стільниця' },
  },
  {
    name: 'Довговічна фурнітура',
    summary: 'Механізми з гарантією.',
    detail: 'Механізми з гарантією на 25 років, плавне доведення.',
    image: { src: 'images/material-hardware.jpg', alt: 'Стільниця з фурнітурою' },
  },
];

const STEPS: readonly ProcessStep[] = [
  { label: 'Замір', detail: 'Приїжджаємо, коли зручно вам.' },
  { label: 'Проєкт', detail: 'Малюємо 3D-модель, враховуючи кожен сантиметр.' },
  { label: 'Монтаж', detail: 'Привозимо, збираємо, прибираємо за собою.' },
];

const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote: '«Lio Mebli» зробили нашу кухню серцем дому. Тепер готувати — це медитація.',
    author: 'Олена та Іван Т., Харків',
  },
  {
    quote: 'Замір, проєкт і монтаж — усе точно в строк. Жодного «плюс-мінус тиждень».',
    author: 'Андрій П., Полтава',
  },
  {
    quote: 'Через два роки щоденного користування фасади виглядають як у перший день.',
    author: 'Марія К., Львів',
  },
];

@Component({
  selector: 'app-home-page',
  imports: [
    CallBand,
    HeroPanel,
    MaterialPicker,
    ProcessSteps,
    ProjectCard,
    ReviewForm,
    ServiceRow,
    TestimonialCarousel,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly heading = HEADING;

  protected readonly lede = LEDE;

  protected readonly hero = HERO;

  protected readonly services = SERVICES;

  protected readonly callHeading = CALL_HEADING;

  protected readonly callLede = CALL_LEDE;

  protected readonly callHours = CALL_HOURS;

  protected readonly phone = SITE_PHONE;

  protected readonly projects = PROJECTS;

  protected readonly materials = MATERIALS;

  protected readonly steps = STEPS;

  protected readonly testimonials = TESTIMONIALS;

  private readonly metadata = inject(PageMetadata);

  constructor() {
    this.metadata.apply({ title: HEADING, path: '/', description: DESCRIPTION });
  }
}
