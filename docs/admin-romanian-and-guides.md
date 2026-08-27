# Romanian admin & in-app guides

Two changes aimed at making the admin usable by people who do not think in
Medusa's data model: the dashboard now opens in Romanian, and the common jobs
carry step-by-step checklists in the pages where the work happens.

---

## Romanian by default

Medusa already ships a Romanian locale — it was simply neither complete nor
selected. Both are fixed by a pinned pnpm patch of `@medusajs/dashboard@2.6.1`
(`backend/patches/`).

### What the patch changes

| File | Change |
| --- | --- |
| `src/i18n/config.ts` | Drop `header` from detection; `fallbackLng: ["ro", "en"]` |
| `src/i18n/translations/ro.json` | Add the 28 keys missing versus `en.json` |
| `dist/app.js`, `dist/chunk-4SVUQSQ5.mjs` | Same two changes, in the compiled copy |

**Why `dist` is patched too.** The package ships its translations twice: the
JSON under `src`, and a compiled copy inside `dist`. The admin build reads
`dist`. Patching only the source changes nothing visible — a trap worth
remembering. To avoid two hand-maintained copies of the wording, the `dist`
patch injects a deep-merge at the `resources` expression that reads the same
values, so `ro.json` stays the single place to edit.

### Language resolution

`cookie "lng"` → `localStorage "lng"` → `fallbackLng`.

`Accept-Language` is deliberately no longer consulted: this is a Romanian shop
and the admin should open in Romanian whatever the browser is set to. Someone
who picks another language in **Profil → Limbă** still keeps it, because
i18next writes that choice to the cookie and localStorage, which are checked
first. English remains the second fallback so a key missing from `ro.json`
renders real text rather than a raw key name.

### Coverage

`ro.json` now matches `en.json` at **1910/1910** keys, with no interpolation
placeholder drift. The added keys cover shipping profiles, order fulfilment,
stock locations, sales channels, store settings and shared labels.

### Caveat

The patch is pinned to **2.6.1**. Upgrading `@medusajs/dashboard` will fail
`pnpm install` until the patch is refreshed. That is the intended failure
mode — loud, rather than a silent revert to English.

### Known rough edges in upstream Romanian

Medusa's shipped Romanian is partly machine-translated and some labels are
plainly wrong. These are **not** corrected — the guides quote them verbatim so
readers can match what is on screen, and explain them in plain language
instead.

| On screen | Should be | Means |
| --- | --- | --- |
| „Mâner" | „Identificator" | the product's URL handle |
| „Creați împlinire" | „Creați livrarea" | create a fulfilment |
| „Truse de inventar" | „Stoc" | inventory |
| „Organiza" | „Organizare" | the organise step |
| „Proiect" | „Ciornă" | draft status |
| „Capta" | „Încasează" | capture (short form) |

Correcting these is a small extension of the existing patch if wanted.

---

## In-app guides

`Setări → Ghiduri` lists every guide. The relevant ones also appear inline:

| Guide | Also shown on |
| --- | --- |
| Încasarea plății pentru o comandă | order detail (`order.details.before`) |
| Adăugarea unui produs cu variante | product list (`product.list.before`) |
| Un produs nu apare pe stoc | product list (`product.list.before`) |

Each guide is a numbered checklist with per-step detail and, where people
commonly go wrong, a highlighted warning. Progress is stored in `localStorage`
per browser — a half-finished checklist is a personal scratchpad, not shop
data, and one operator must never be able to clear another's. Every storage
access is guarded, since it throws in private windows.

Panels are **collapsed by default** when embedded, so someone who knows the
job is not scrolling past instructions every time.

### Why the wording is what it is

Step text quotes button labels exactly as they appear, including the awkward
ones above. A guide that silently renames things is a guide you cannot follow.
The plain-language explanation lives in the step detail, never in place of the
label.

The content is also shop-specific rather than generic Medusa documentation —
the product guide insists the SKU must equal the SmartBill `productCode`, and
the stock guide routes people to `Verificare SmartBill`. That is where the
value is over the official docs.

### Adding or editing a guide

All content is in `backend/src/admin/components/guides/guides-data.ts`. Add a
`Guide` object, then either add it to `GUIDES` (for the Ghiduri page) or
reference it from a widget. Step `id`s are the localStorage keys, so renaming
one resets that step's checkmark — harmless, but avoid churn.

| Path | Role |
| --- | --- |
| `components/guides/guides-data.ts` | The content |
| `components/guides/guide-panel.tsx` | Collapsible checklist UI |
| `components/guides/use-guide-progress.ts` | localStorage progress |
| `routes/settings/ghiduri/page.tsx` | The Ghiduri page |
| `widgets/order-detail-guide.tsx` | Inline on order detail |
| `widgets/product-list-guide.tsx` | Inline on product list |

---

## What was deliberately not done

A redesign. The extension API allows new routes and widgets in ~12 injection
zones; it does **not** allow removing or restructuring core admin pages without
forking `@medusajs/dashboard`. Guides are the cheap, reversible first step —
if they turn out not to be enough, the next move is a guided product-create
wizard in the shape of the existing `Setări Produse` flow.
