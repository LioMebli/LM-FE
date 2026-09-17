# Images the homepage serves

Six files, 140 426 bytes together. Every one of them is temporary except where this file says
otherwise, and every one is named here with where it came from — so the next reader does not have
to work it out again.

## The hero

| File | Bytes | Where it came from |
|---|---|---|
| `hero-kitchen.webp` | 55 918 | `LM-FE/AdditionalMaterials/Kitchens/Main kitchen 1.jpg`, committed by [LM-147](https://liomebli.atlassian.net/browse/LM-147) in the same change. WebP q72 at the source's own width, 1376×768 |

**It is the page's LCP element**, which is why it is WebP rather than the 664 134-byte JPEG and why
it loads with `priority`.

⚠️ **One width, not three, and that is a decision rather than an omission.**
[`specs/LM-147/tasks.md`](../../../specs/LM-147/tasks.md) T049 asked for three. Converting first and
measuring after changed the answer: the whole photograph is **55.9 KB**, so a second, narrower file
would save a phone roughly 30 KB — about a tenth of a second on 4G. Buying that needs an
`IMAGE_LOADER`, which `NgOptimizedImage` applies to **every** image in the application, including
the product media [LM-2](https://liomebli.atlassian.net/browse/LM-2) will add on a completely
different URL shape. A global rule bought for one file is the wrong trade; the loader belongs with
the media pipeline that will actually have several sizes to choose between.

## The catalog photographs — all temporary

Carried unchanged from `specs/LM-51/mockup/photos/`, which is the drawing's own set. They are
placeholders for a photo shoot that has not happened; replacing them is
[LM-7](https://liomebli.atlassian.net/browse/LM-7).

| File | Was | Used as |
|---|---|---|
| `project-anthracite.jpg` | `12-kuhnia-interno.jpg` | the first finished project |
| `project-warm-wood.jpg` | `11-kuhnia-vudlain.jpg` | the second finished project |
| `material-oak.jpg` | `09-panel-dub.jpg` | oak |
| `material-stone.jpg` | `10-panel-kamin.jpg` | stone and quartz |
| `material-hardware.jpg` | `07-stilnytsia-a.jpg` | hardware |

⚠️ **Three of them do not show what their caption says**, and this is known rather than missed.
`material-hardware.jpg` is a worktop, not a mechanism; the two project photographs are stock
kitchens rather than anything this company built. The captions were written for the drawing and
the pictures were the closest the mockup had. **Correcting the pictures is
[LM-7](https://liomebli.atlassian.net/browse/LM-7)'s, not the captions'** — rewriting a caption to
match a placeholder is work that gets thrown away the day the real photograph arrives.
