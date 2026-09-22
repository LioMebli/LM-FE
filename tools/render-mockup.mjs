/* Turns a .dc.html drawing into a plain page our dev server can serve from the same
   origin, so the drawing and the site can be read side by side in two frames.

   Run it with `node tools/render-mockup.mjs`, then `npm start` and open
   /__mockup/compare.html?w=360 — the site and the drawing stand in two frames of the same
   width. public/__mockup/ is gitignored, and site-checks.mjs fails a release that carries
   it, so the working copy can never become a second homepage.

   Why it exists: three passes comparing rendered properties each missed what reading the
   two pages side by side finds in a minute. specs/LM-147/tasks.md phase 5c. */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DRAWINGS = 'AdditionalMaterials/ClaudeDesign/main-page-responsive';
const OUT = 'public/__mockup';

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

/* The drawing's own defaults, read out of its <script type="text/x-dc">: the second
   material is chosen, the first review is shown, the cart is empty, the menu is shut. */
const VALUES = {
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
      key in VALUES ? VALUES[key] : whole,
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

render('MainPagePhone');
render('MainPageWide');
copyFileSync('tools/mockup-compare.html', join(OUT, 'compare.html'));
console.log('written to', OUT);
