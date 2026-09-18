import { readFileSync } from 'node:fs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');

const body = html.slice(html.indexOf('<x-dc>') + 6, html.indexOf('</x-dc>'));
const markup = body.replace(/<helmet>[\s\S]*?<\/helmet>/, '');

const OPEN = /<([a-z0-9-]+)((?:\s+[^>]*?)?)>/gi;

function attrs(raw) {
  const out = {};
  const re = /([a-z-]+)\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = re.exec(raw))) out[m[1].toLowerCase()] = m[2];
  return out;
}

function declarations(style) {
  const out = {};
  for (const part of style.split(';')) {
    const at = part.indexOf(':');
    if (at < 0) continue;
    const prop = part.slice(0, at).trim();
    const value = part.slice(at + 1).trim();
    if (prop) out[prop] = value.replace(/\s+/g, ' ');
  }
  return out;
}

const elements = [];
const stack = [];
let m;

while ((m = OPEN.exec(markup))) {
  const tag = m[1].toLowerCase();
  const a = attrs(m[2] ?? '');
  const before = markup.slice(0, m.index);
  const depth = (before.match(/<(?!\/)(?!br|img|input|path|circle|meta|link)[a-z0-9-]+[^>]*>/gi) ?? []).length -
    (before.match(/<\/[a-z0-9-]+>/gi) ?? []).length;

  elements.push({
    tag,
    id: a.id,
    cls: a.class,
    section: a.id && ['top', 'services', 'projects', 'steps', 'reviews', 'foot', 'contact', 'selection'].includes(a.id) ? a.id : undefined,
    style: a.style ? declarations(a.style) : {},
    hover: a['style-hover'] ? declarations(a['style-hover']) : undefined,
    text: undefined,
    depth,
  });
}

let current = '(before any section)';
for (const el of elements) {
  if (['section', 'footer', 'header', 'aside'].includes(el.tag)) current = el.id ?? el.tag;
  el.owner = current;
}

const wanted = new Set([
  'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing', 'text-transform',
  'color', 'background', 'background-color', 'border', 'border-radius', 'border-bottom', 'border-top',
  'padding', 'margin', 'gap', 'display', 'flex-direction', 'grid-template-columns', 'aspect-ratio',
  'width', 'height', 'min-height', 'max-width', 'min-width', 'flex', 'align-items', 'justify-content',
  'text-align',
]);

const rows = elements
  .map((el) => {
    const kept = Object.fromEntries(Object.entries(el.style).filter(([p]) => wanted.has(p)));
    return { ...el, style: kept };
  })
  .filter((el) => Object.keys(el.style).length > 0);

if (process.argv[3] === '--summary') {
  const bySection = {};
  for (const el of rows) (bySection[el.owner] ??= []).push(el);
  for (const [section, list] of Object.entries(bySection)) {
    console.log(`\n=== ${section} — ${list.length} styled element(s) ===`);
    for (const el of list) {
      const label = [el.tag, el.id && `#${el.id}`, el.cls && `.${el.cls.split(' ')[0]}`].filter(Boolean).join('');
      const props = Object.entries(el.style).map(([p, v]) => `${p}: ${v}`).join('; ');
      console.log(`  ${label.padEnd(26)} ${props}`);
    }
  }
} else {
  console.log(JSON.stringify(rows, null, 1));
}

console.error(`${file}: ${elements.length} elements, ${rows.length} carrying styles we compare`);
