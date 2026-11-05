# Xero POC

Local proof of concept for the Xero multi-site CMS success criteria. Schema and content live in the **Xero POC** Hygraph project. Experimentation is not included.

```bash
cd ~/xero-poc
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

## URLs

| Path | What it proves |
|---|---|
| `/`, `/au`, `/nz`, `/uk` | Shared home, regional prefix (Global has none) |
| `/{region}/pricing` | Shared plans + region discount |
| `/{region}/blog` | Blog index lists posts assigned to that region |
| `/{region}/blog/1` | Shared post; UK uses `en_GB` |
| `/uk/blog/1` | CTA is `one-off override` |
| `/au/blog/1` | CTA is `Blog Signup` |
| `/blog/global-excluded` | 404 (Global excluded) |
| `/uk/blog/global-excluded` | Exists |
| `/uk/campaign/uk-only` | UK-only page, 95% / 6 month discount |
| `/au/campaign/uk-only` | 404 |

## Branding (theme colors + logo)

Brand surfaces are no longer hard-coded — they come from a **Branding** component
on the single **Site Settings** entry (global, shared by all regions):

| Field | Applied to |
|---|---|
| `logo` (Asset) | Header + footer logo image |
| `navBarColor` (Color) | Nav bar and footer background |
| `bannerColor` (Color) | Promo banner background |
| `primaryButtonColor` (Color) | Primary CTA button |

The frontend reads these from `siteSettingses[0].branding` and applies the colors
as inline styles (with the original hex values as fallbacks if a field is empty).
Colors and the logo are also click-to-editable in preview mode.

## Live Preview & Click-to-Edit

Powered by `@hygraph/preview-sdk`. Every rendered field carries `data-hygraph-*`
attributes, so editors can click a value on the page and jump straight to that
field in the Studio.

- `?preview=1` on any URL serves **DRAFT** content and turns on click-to-edit
  (the `Stage` row in the debug bar confirms which stage you are viewing).
- `&locale=en_GB` renders a specific locale, which is how the Studio locale
  switcher previews translations (base locale is `en`).

How fields map to edit targets:

- Scalar fields on a document (blog post title/body, plan title/price) point at
  their own entry.
- Fields inside components (basic text block headline/body, plan block
  disclaimer, nav links, footer columns, promo banner/price copy) carry a
  component chain back to the root document.
- Derived strings point at the field that actually owns the text: the promo
  banner and plan-price sentence edit the `PromoCopy` templates, and the CTA
  edits whichever source won resolution (page override → CtaRule → navbar →
  Site Settings).

### Variant preview

Page variants (alternate block layouts targeted at segments) are not addressable
on their own, so they preview on their parent page's URL with the variant's
blocks swapped in:

- `?preview=1&variant={variantId}` renders that variant's `blocks` instead of
  the page's, rooted at the variant entry. Click-to-edit targets every field on
  the variant, and the `blocks` list is tagged as a reorderable component array
  so dragging to reorder components updates live.
- `/preview/variant/{variantId}` resolves the parent page and region
  automatically, then redirects to the URL above. Use this as the Studio preview
  template for the **PageVariant** model: `…/preview/variant/{id}`.

### One-time Studio setup

1. **Schema → Preview URLs**: add a preview URL template such as
   `http://localhost:3002/{path}?preview=1&locale={locale}` (the `{locale}`
   token enables the locale switcher). For the **PageVariant** model, use
   `http://localhost:3002/preview/variant/{id}`.
2. **Schema → Sidebar**: add the **Preview** sidebar widget so the preview
   panel/iframe appears when editing an entry.

### Environment

`.env.local` adds two browser-exposed values used by the preview SDK:

```bash
NEXT_PUBLIC_HYGRAPH_ENDPOINT=<same Content API endpoint as HYGRAPH_ENDPOINT>
NEXT_PUBLIC_HYGRAPH_STUDIO_URL=https://app.hygraph.com
```

> Note: click-to-edit opens the field in the document's default locale; the
> editor picks the locale in Studio. If embedding the iframe is ever blocked,
> check the host's `X-Frame-Options`/`frame-ancestors`.
