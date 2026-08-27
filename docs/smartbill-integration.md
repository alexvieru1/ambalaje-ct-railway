# SmartBill inventory integration

SmartBill Cloud is the source of truth for stock. This document records what
was built, what was applied to the live database, and what still needs a
human decision.

Implementation detail lives next to the code in
[`backend/src/lib/smartbill/README.md`](../backend/src/lib/smartbill/README.md).

---

## Why this exists

Stock was maintained in SmartBill and re-typed into Medusa. The two drifted,
and because every variant is `manage_inventory=true, allow_backorder=false`,
drift shows up on the storefront as products that cannot be bought.

## How the two catalogues are joined

Medusa `product_variant.sku` is matched against SmartBill `productCode`,
trimmed and case-insensitive. Nothing else is used.

Findings from the live data at the time of writing:

- SmartBill has **two gestiuni**: `MAGAZIN` (retail, all zero) and `DEPOZIT`
  (wholesale, ~1,862 products). The webshop maps to **`DEPOZIT`**.
- **137 of 148** variants match by SKU. No duplicate codes on either side, so
  SKU is a safe join key.
- SmartBill's catalogue is far larger than the webshop's — ~1,725 codes have no
  Medusa variant. That is expected and ignored.
- SmartBill reports **decimal** quantities (`0.67 BAX`, `107.3 KG`). Medusa
  inventory is a non-negative integer, so quantities are **rounded down** —
  the only direction that cannot promise stock that does not exist.
- SmartBill returns **HTTP 200 with an `errorText` body** on failure, including
  authentication failure. The client checks `errorText`, not the status code.

## Safety rules the sync follows

- **Matched variants are set, not adjusted.** SmartBill's figure overwrites
  `stocked_quantity`.
- **Unmatched variants are left untouched**, never zeroed. Zeroing on a
  mistyped SKU would silently pull products off the storefront.
- **Missing inventory levels are created**, so a variant that never had a level
  starts being tracked.
- **Dry run is the default.** Writes require `SMARTBILL_SYNC_DRY_RUN=false`,
  and the scheduled job additionally requires `SMARTBILL_SYNC_ENABLED=true`.
- **Stale reservations are released only when old *and* orphaned** — the line
  item is gone, or its order is canceled. Age alone would drop reservations on
  legitimately unfulfilled orders and let the same stock sell twice.

---

## What was applied to the live database

A snapshot was taken first, then the sync was applied once by hand:

| | |
| --- | --- |
| Inventory levels created | 69 |
| Levels updated | 62 |
| Already correct | 6 |
| Variants skipped (no SmartBill code) | 11 |

Verified afterwards by re-fetching SmartBill and re-reading the database:
**137/137 exact, 0 mismatches**. A second run reports `0 created, 0 updated,
137 unchanged`, so the sync is idempotent.

Practical effect: 60 variants that had no inventory level — and were therefore
unbuyable — became purchasable. Two SKUs (146, 264) went from a seeded
placeholder of 100 to 0.

**The scheduled job is still switched off.** Turning on an hourly job that
overwrites production stock is a deliberate decision, not a side effect of
shipping the code.

---

## Operating it

```bash
# uses SMARTBILL_SYNC_DRY_RUN
npx medusa exec ./src/scripts/smartbill-sync.ts

# print the full plan, write nothing
npx medusa exec ./src/scripts/smartbill-sync.ts dry

# apply for real
npx medusa exec ./src/scripts/smartbill-sync.ts apply
```

> Arguments are **bare words, not flags**. `medusa exec` parses anything
> starting with `--` as its own option, so `--apply` never reaches the script
> and the run silently stays a dry run.

Admin API:

| Endpoint | Purpose |
| --- | --- |
| `GET /admin/smartbill-sync` | Report the current configuration |
| `POST /admin/smartbill-sync` | Run a sync (body optional; env defaults apply) |
| `GET /admin/smartbill-audit` | Reconciliation report (`?refresh=1` to bypass cache) |
| `POST /admin/smartbill-audit/assign-sku` | Point a variant at a SmartBill code |

To enable the scheduled job, set on the Railway service that runs as
`worker` or `shared`:

```
SMARTBILL_SYNC_ENABLED=true
SMARTBILL_SYNC_DRY_RUN=false
```

Watch a dry run in the logs first. All SmartBill env vars are listed in the
[module README](../backend/src/lib/smartbill/README.md#configuration).

---

## The audit page

`Setări → Verificare SmartBill` in the admin lists only the variants that need
a decision, grouped by problem, with click-to-filter summary cards.

| Kind | Meaning | Fixable on the page |
| --- | --- | --- |
| Fără SKU | No SKU at all | yes |
| Lipsă în SmartBill | Has a SKU, SmartBill has no such code | yes |
| Fără stoc configurat | Matched, no inventory level yet | no — run the sync |
| Diferență stoc | Matched, quantities disagree | no — run the sync |

For the fixable kinds it proposes codes ranked by two independent signals —
name-token overlap (numbers weighted double, since dimensions identify
packaging) and closeness of the SmartBill code to the SKU already on the
variant. A candidate backed by both outranks one backed by either alone.

---

## Open catalogue decisions

11 variants do not match SmartBill. Only **one** is a straightforward fix:

- *Cutie tort cu capac alb — 40x40xH40* → code `1205` (`CUTIE TORT 40X40X40`).

**Eight are pair conflicts, not typos.** Products come in twins — for example
*Cutie prăjituri "Pastry" 13x10xH8 K2* and *Cutie prăjituri chocolate
13x10xH8 K2* — that correspond to a **single** SmartBill product. The
"chocolate" twin holds the real code (`203`, `449`, `709`, `883`, `1060`,
`1375`); the "Pastry" twin was given the same code with a digit appended,
because Medusa enforces unique SKUs.

The audit page shows these suggestions as *indisponibil* and names the holder
rather than offering a click that would fail. Resolving them is a catalogue
decision:

1. If the two are really the same article — merge or delete one, or
2. If they are genuinely different — create a separate product in SmartBill.

**Two have no good candidate**: the *14x12xH8 K6* pair. That article may simply
not exist in `DEPOZIT`.

---

## Layout

| Path | Role |
| --- | --- |
| `backend/src/lib/smartbill/client.ts` | Read-only SmartBill REST client |
| `backend/src/lib/smartbill/reconcile.ts` | Sync planning — pure, no Medusa deps |
| `backend/src/lib/smartbill/audit.ts` | Reconciliation report — pure |
| `backend/src/lib/smartbill/suggest.ts` | Fuzzy code/name matching — pure |
| `backend/src/workflows/sync-smartbill-inventory.ts` | The sync workflow |
| `backend/src/jobs/smartbill-inventory-sync.ts` | Scheduled job |
| `backend/src/api/admin/smartbill-sync/` | Sync trigger + config report |
| `backend/src/api/admin/smartbill-audit/` | Audit report + SKU assignment |
| `backend/src/admin/routes/settings/smartbill-audit/` | Admin page |
| `backend/src/scripts/smartbill-sync.ts` | CLI entry point |

All decision logic sits in the three pure modules, which is what the 62 tests
exercise. The Medusa-facing code is plumbing.
