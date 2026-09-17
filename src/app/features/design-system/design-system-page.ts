import { Component, inject, signal } from '@angular/core';

import { PageMetadata } from '../../core/seo/page-metadata';
import { Availability } from '../../core/api/catalog.types';
import { ActionButton } from '../../ui/action-button/action-button';
import { AvailabilityLabel } from '../../ui/availability-label/availability-label';
import { BreadcrumbTrail } from '../../ui/breadcrumb-trail/breadcrumb-trail';
import { CallBand } from '../../ui/call-band/call-band';
import { CategoryCard } from '../../ui/category-card/category-card';
import { CheckboxRow } from '../../ui/checkbox-row/checkbox-row';
import { FilterChip } from '../../ui/filter-chip/filter-chip';
import { FilterSheet } from '../../ui/filter-sheet/filter-sheet';
import { HeroPanel } from '../../ui/hero-panel/hero-panel';
import { Material, MaterialPicker } from '../../ui/material-picker/material-picker';
import { PaginationLink } from '../../ui/pagination-link/pagination-link';
import { ProcessStep, ProcessSteps } from '../../ui/process-steps/process-steps';
import { ProductCard } from '../../ui/product-card/product-card';
import { ProjectCard } from '../../ui/project-card/project-card';
import { ReviewForm } from '../../ui/review-form/review-form';
import { Service, ServiceRow } from '../../ui/service-row/service-row';
import { SocialProfile } from '../../ui/shell.types';
import { Testimonial, TestimonialCarousel } from '../../ui/testimonial-carousel/testimonial-carousel';
import { SelectionLink } from '../../ui/selection-link/selection-link';
import { SiteFooter } from '../../ui/site-footer/site-footer';
import { StickyActionBar } from '../../ui/sticky-action-bar/sticky-action-bar';
import { TextField } from '../../ui/text-field/text-field';
import { VariantBadge } from '../../ui/variant-badge/variant-badge';

export type TokenSample =
  | 'colour'
  | 'border'
  | 'family'
  | 'size'
  | 'leading'
  | 'weight'
  | 'space'
  | 'radius';

export interface TokenGroup {
  title: string;
  sample: TokenSample;
  names: string[];
}

export const TOKEN_GROUPS: readonly TokenGroup[] = [
  {
    title: 'Колір',
    sample: 'colour',
    names: [
      '--lm-color-page',
      '--lm-color-surface',
      '--lm-color-ink',
      '--lm-color-ink-muted',
      '--lm-color-on-dark',
      '--lm-color-primary',
      '--lm-color-link',
      '--lm-color-error',
      '--lm-color-success',
    ],
  },
  { title: 'Відгук на курсор', sample: 'colour', names: ['--lm-hover-veil'] },
  {
    title: 'Рамка',
    sample: 'border',
    names: ['--lm-border-hairline', '--lm-border-control'],
  },
  { title: 'Гарнітура', sample: 'family', names: ['--lm-font-body', '--lm-font-display'] },
  {
    title: 'Кегль',
    sample: 'size',
    names: [
      '--lm-text-sm',
      '--lm-text-md',
      '--lm-text-lg',
      '--lm-text-xl',
      '--lm-text-display',
      '--lm-text-display-lg',
    ],
  },
  { title: 'Інтерліньяж', sample: 'leading', names: ['--lm-leading-body', '--lm-leading-display'] },
  { title: 'Накреслення', sample: 'weight', names: ['--lm-weight-regular', '--lm-weight-bold'] },
  {
    title: 'Відступ',
    sample: 'space',
    names: [
      '--lm-space-xs',
      '--lm-space-sm',
      '--lm-space-md',
      '--lm-space-lg',
      '--lm-space-xl',
      '--lm-space-2xl',
    ],
  },
  {
    title: 'Зона дотику',
    sample: 'space',
    names: ['--lm-tap-target-min', '--lm-tap-target-chip', '--lm-tap-target-footer'],
  },
  { title: 'Ширина змісту', sample: 'space', names: ['--lm-content-max', '--lm-text-max'] },
  { title: 'Висота шапки', sample: 'space', names: ['--lm-header-block-size'] },
  {
    title: 'Радіус',
    sample: 'radius',
    names: ['--lm-radius-md', '--lm-radius-lg', '--lm-radius-pill'],
  },
];

export const SHOWCASE_TOKEN_NAMES: readonly string[] = TOKEN_GROUPS.flatMap(
  (group) => group.names,
);

interface ShowcaseCard {
  name: string;
  price: number;
  availability: Availability;
  variantCount: number;
}

const SHOWCASE_CARDS: readonly ShowcaseCard[] = [
  { name: 'Змішувач кухонний', price: 980, availability: 'IN_STOCK', variantCount: 1 },
  {
    name: 'Мийка гранітна 510×450 мм, антрацит',
    price: 4850,
    availability: 'IN_STOCK',
    variantCount: 6,
  },
  {
    name: 'Панель стінова, вугільний камінь',
    price: 1340,
    availability: 'DISCONTINUED',
    variantCount: 1,
  },
  {
    name: 'Комплектація кухні під ключ: фурнітура, мийка, змішувач і стільниця',
    price: 104800,
    availability: 'MADE_TO_ORDER',
    variantCount: 1,
  },
];

const SHOWCASE_PHONE = '+380671234567';

const SHOWCASE_ADDRESS = 'вул. Сумська 10, Харків';

const SHOWCASE_EMAIL = 'info@liomebli.com.ua';

const SHOWCASE_STEPS: readonly ProcessStep[] = [
  { label: 'Перший крок', detail: 'Короткий рядок пояснення.' },
  { label: 'Другий крок', detail: 'Довший рядок, який на вузькому екрані перенесеться.' },
  { label: 'Третій крок', detail: 'І ще один.' },
];

const SHOWCASE_HERO_PANEL = {
  heading: 'Lio Mebli',
  lede: 'Створюємо простір, де кожен сантиметр має значення.',
};

const SHOWCASE_SERVICES: readonly Service[] = [
  { name: 'Проєктування', detail: 'Індивідуальні рішення під ваш простір.' },
  { name: 'Виготовлення', detail: 'Чесні матеріали й власне виробництво.' },
  { name: 'Монтаж', detail: 'Привозимо, збираємо, прибираємо за собою.' },
];

const SHOWCASE_CALL = {
  heading: 'Один дзвінок — і ми порахуємо вашу кухню',
  lede: 'Безкоштовна консультація: підберемо планування, матеріали й фурнітуру під ваш простір і бюджет, назвемо точну ціну та строк.',
  hours: 'Пн–Сб, 9:00–19:00',
};

const SHOWCASE_PROJECTS: readonly { name: string; lede: string }[] = [
  { name: 'Кухня «Anthracite Minimal»', lede: 'Матові фасади та інтегроване освітлення.' },
  { name: 'Вітальня «Warm Wood»', lede: 'Поєднання дуба та мʼяких ліній.' },
];

const SHOWCASE_MATERIALS: readonly Material[] = [
  {
    name: 'Натуральний дуб',
    summary: 'Шпон із живою текстурою.',
    detail: 'Шпон із живою текстурою, олійне покриття, тепла матова поверхня.',
  },
  {
    name: 'Камінь і кварц',
    summary: 'Стійкі поверхні.',
    detail: 'Стійкі поверхні, що не бояться гарячого посуду й вологи.',
  },
  {
    name: 'Довговічна фурнітура',
    summary: 'Механізми з гарантією.',
    detail: 'Механізми з гарантією на 25 років, плавне доведення.',
  },
];

const SHOWCASE_TESTIMONIALS: readonly Testimonial[] = [
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

const SHOWCASE_CATEGORIES: readonly string[] = [
  'Петлі',
  'Ручки меблеві',
  'Напрямні прихованого монтажу з доводчиком',
  'Кріплення',
];

const SHOWCASE_SOCIALS: readonly SocialProfile[] = [
  { network: 'Instagram', href: 'https://www.instagram.com/' },
  { network: 'Facebook', href: 'https://www.facebook.com/' },
  { network: 'Telegram', href: 'https://telegram.org/' },
  { network: 'Viber', href: 'https://www.viber.com/' },
];

const SHOWCASE_AVAILABILITY: readonly Availability[] = [
  'IN_STOCK',
  'MADE_TO_ORDER',
  'DISCONTINUED',
];

@Component({
  selector: 'app-design-system-page',
  imports: [
    ActionButton,
    AvailabilityLabel,
    BreadcrumbTrail,
    CallBand,
    CategoryCard,
    CheckboxRow,
    FilterChip,
    FilterSheet,
    HeroPanel,
    MaterialPicker,
    PaginationLink,
    ProcessSteps,
    ProductCard,
    ProjectCard,
    ReviewForm,
    SelectionLink,
    ServiceRow,
    TestimonialCarousel,
    SiteFooter,
    StickyActionBar,
    TextField,
    VariantBadge,
  ],
  templateUrl: './design-system-page.html',
  styleUrl: './design-system-page.scss',
})
export class DesignSystemPage {
  protected readonly tokenGroups = TOKEN_GROUPS;
  protected readonly cards = SHOWCASE_CARDS;
  protected readonly categories = SHOWCASE_CATEGORIES;
  protected readonly heroPanelSample = SHOWCASE_HERO_PANEL;
  protected readonly serviceSamples = SHOWCASE_SERVICES;
  protected readonly callSample = SHOWCASE_CALL;
  protected readonly projectSamples = SHOWCASE_PROJECTS;
  protected readonly materialSamples = SHOWCASE_MATERIALS;
  protected readonly testimonialSamples = SHOWCASE_TESTIMONIALS;
  protected readonly samplePhone = SHOWCASE_PHONE;
  protected readonly sampleAddress = SHOWCASE_ADDRESS;
  protected readonly sampleEmail = SHOWCASE_EMAIL;
  protected readonly stepSamples = SHOWCASE_STEPS;
  protected readonly availabilityStates = SHOWCASE_AVAILABILITY;
  protected readonly socials = SHOWCASE_SOCIALS;

  protected readonly lastAction = signal('нічого ще не натиснуто');

  private readonly metadata = inject(PageMetadata);

  constructor() {
    this.metadata.apply({
      title: 'Дизайн-система',
      path: '/design-system',
      noindex: true,
    });
  }

  protected sampleOf(name: string): string {
    return `var(${name})`;
  }

  protected record(action: string): void {
    this.lastAction.set(action);
  }
}
