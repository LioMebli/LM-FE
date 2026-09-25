import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DRAWINGS = 'AdditionalMaterials/ClaudeDesign/main-page-responsive';
export const MIRROR = '__mockup';

const OUT = `public/${MIRROR}`;

const PHOTOGRAPHS = {
  './hero-kitchen.jpg': '/images/hero-kitchen.webp',
  '../../photos/12-kuhnia-interno.jpg': '/images/project-anthracite.jpg',
  '../../photos/11-kuhnia-vudlain.jpg': '/images/project-warm-wood.jpg',
  '../../photos/09-panel-dub.jpg': '/images/material-oak.jpg',
  '../../photos/10-panel-kamin.jpg': '/images/material-stone.jpg',
  '../../photos/07-stilnytsia-a.jpg': '/images/material-hardware.jpg',
  '../../lm-logo.svg': '/lm-logo.svg',
  './lm-mark.svg': '/lm-mark.svg',
};

const DRAWING_DEFAULTS = {
  menuOpen: '0',
  cart: '0',
  actA: '0',
  actB: '1',
  actC: '0',
  textA: 'Шпон із живою текстурою.',
  textB: 'Стійкі поверхні, що не боятьcя гарячого посуду й вологи.',
  textC: 'Механізми з гарантією.',
  review: '0',
  act0: '1',
  act1: '0',
  act2: '0',
  searchOpen: '0',
  formName: '',
  formText: '',
  formNote: '',
};

function render(name) {
  const source = readFileSync(join(DRAWINGS, `${name}.dc.html`), 'utf8');

  const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(source)?.[1] ?? '';
  let body = /<x-dc>([\s\S]*?)<\/x-dc>/.exec(source)?.[1] ?? '';

  body = body
    .replace(/<helmet>[\s\S]*?<\/helmet>/, '')
    .replace(/\son[A-Z][a-zA-Z]*="\{\{[^}]*\}\}"/g, '')
    .replace(/\sref="\{\{[^}]*\}\}"/g, '')
    .replace(/\sstyle-(hover|active)="[^"]*"/g, '')
    .replace(/\{\{\s*([a-zA-Z0-9]+)\s*\}\}/g, (whole, key) =>
      key in DRAWING_DEFAULTS ? DRAWING_DEFAULTS[key] : whole,
    );

  const head = helmet
    .replace(/<script[^>]*><\/script>/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');

  let page = `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Макет — ${name}</title>
${head}
</head>
<body>
${body}
</body>
</html>
`;

  for (const [drawn, served] of Object.entries(PHOTOGRAPHS)) {
    page = page.split(drawn).join(served);
  }

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, `${name === 'MainPagePhone' ? 'phone' : 'wide'}.html`), page, 'utf8');
}

if (import.meta.main) {
  render('MainPagePhone');
  render('MainPageWide');
  copyFileSync('tools/mockup-compare.html', join(OUT, 'compare.html'));
  console.log('written to', OUT);
}
