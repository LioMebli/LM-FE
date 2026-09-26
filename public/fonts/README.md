# Onest — the site's body typeface

Served from this repository, never from `fonts.googleapis.com`. A render-blocking request to a
third party sits in the critical path of the page a visitor arrives on, and
[`tools/site-checks.mjs`](../../tools/site-checks.mjs) fails the release if one reappears.

**Licence**: SIL Open Font License 1.1 — [`OFL.txt`](./OFL.txt), copyright 2021 The Onest Project
Authors. Redistribution inside this repository is what the licence is for; the copyright notice
must travel with the files, which is why `OFL.txt` sits beside them.

## What the three files are

Downloaded 2026-09-13 from the URLs Google Fonts' CSS API returns for
`family=Onest:wght@400;600;700`. They are Google's own subsets, not something we cut — which is
why no `fonttools` step exists and none is needed.

| File | `unicode-range` | Bytes |
|---|---|---|
| `onest-latin.woff2` | `U+0000-00FF` plus punctuation, quotes and the dashes at `U+2000-206F` | 33 760 |
| `onest-cyrillic.woff2` | `U+0301`, `U+0400-045F`, `U+0490-0491`, `U+04B0-04B1`, `U+2116` | 15 860 |
| `onest-cyrillic-ext.woff2` | `U+0460-052F`, `U+1C80-1C8A`, **`U+20B4`**, `U+2DE0-2DFF`, `U+A640-A69F`, `U+FE2E-FE2F` | 10 540 |

**`cyrillic-ext` is here for one character.** `U+20B4` is ₴, and `Intl.NumberFormat('uk-UA')` may
render a price with it. Ten kilobytes to never show a visitor a missing-glyph box on a price is
worth paying; the rest of that range is never drawn and never downloaded, because the browser
fetches a subset only when the page actually uses a character from it.

**The Greek, Vietnamese, maths and symbol subsets are deliberately absent.** The site is
Ukrainian-only, so they are weight with no reader.

## One file covers 400, 600 and 700

Onest is a variable font, and Google returns the **same URL** for all three weights of a given
subset — verified by reading the CSS API response 2026-09-13. So `styles.scss` declares each
subset once with `font-weight: 400 700`, and the browser interpolates. Three files, not nine.

## Re-fetching them

The URLs carry a version directory (`/v11/`) and a content hash, so they are not stable across
Google's releases. To refresh:

```powershell
Invoke-WebRequest -Uri 'https://fonts.googleapis.com/css2?family=Onest:wght@400;600;700&display=swap' `
  -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
```

The `User-Agent` is not optional: without a modern one Google serves `ttf` instead of `woff2`.
Take the `latin`, `cyrillic` and `cyrillic-ext` URLs from the response, and copy their
`unicode-range` values into `src/styles.scss` unchanged — a range that drifts from its file is a
glyph that silently falls back to the system font.
