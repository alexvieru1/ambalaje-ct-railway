# SmartBill inventory sync

SmartBill Cloud is the source of truth for stock. This sync pulls quantities
from a SmartBill *gestiune* (warehouse) and makes the matching Medusa
inventory levels agree with it.

## How matching works

Medusa `product_variant.sku` is matched against SmartBill `productCode`,
trimmed and case-insensitive. Nothing else is used — not the product name, not
the measuring unit.

Consequences worth knowing:

- **A variant with no matching SmartBill code is left untouched.** It is
  reported in the logs and in the API response, but its stock is never zeroed.
  Zeroing would silently pull products off the storefront the first time
  someone mistypes a SKU.
- **SmartBill codes with no Medusa variant are ignored.** The SmartBill
  catalogue is much larger than the storefront catalogue; only a count is
  logged.
- **Matched variants are set, not adjusted.** SmartBill's figure overwrites
  `stocked_quantity` outright.
- **Fractional quantities are rounded down.** SmartBill reports decimals
  (`0.67 BAX`, `107.3 KG`); Medusa inventory is a non-negative integer, and
  rounding down can never promise stock that does not exist.
- **Missing inventory levels are created**, so a variant that has never had a
  level at the location starts being tracked.

## Configuration

| Variable | Meaning |
| --- | --- |
| `SMARTBILL_USERNAME` | SmartBill Cloud → Contul meu → Integrari |
| `SMARTBILL_TOKEN` | API token from the same screen |
| `SMARTBILL_CIF` | Company CIF |
| `SMARTBILL_WAREHOUSE` | Gestiune name, **case-sensitive** (e.g. `DEPOZIT`) |
| `SMARTBILL_STOCK_LOCATION_ID` | Medusa stock location the gestiune maps to |
| `SMARTBILL_SYNC_ENABLED` | `true` to run the scheduled job at all |
| `SMARTBILL_SYNC_CRON` | Cron expression; defaults to `15 * * * *` |
| `SMARTBILL_SYNC_DRY_RUN` | Writes happen only on an explicit `false` |
| `SMARTBILL_RESERVATION_MAX_AGE_HOURS` | `0` disables reservation release |

Both `SMARTBILL_SYNC_ENABLED` and `SMARTBILL_SYNC_DRY_RUN` have to be set
deliberately before anything is written: the job is off by default and dry by
default.

## Running it

```bash
# uses SMARTBILL_SYNC_DRY_RUN
npx medusa exec ./src/scripts/smartbill-sync.ts

# dry run — prints the full plan, writes nothing
npx medusa exec ./src/scripts/smartbill-sync.ts dry

# apply for real
npx medusa exec ./src/scripts/smartbill-sync.ts apply
```

The arguments are bare words, not flags: `medusa exec` parses anything
starting with `--` as its own option, so `--apply` never reaches the script.

From the admin API:

```bash
curl -X GET  /admin/smartbill-sync                      # report configuration
curl -X POST /admin/smartbill-sync -d '{}'              # run with env defaults
curl -X POST /admin/smartbill-sync -d '{"dry_run":true}'
```

## Stale reservations

`SMARTBILL_RESERVATION_MAX_AGE_HOURS` releases reservations that are **both**
older than the cutoff **and** orphaned — the line item is gone, or its order is
canceled. Age alone is deliberately not enough: a legitimately unfulfilled
order can sit for days, and dropping its reservation would let the same stock
be sold twice.

## Layout

| File | Role |
| --- | --- |
| `client.ts` | Read-only SmartBill REST client (`GET /stocks`) |
| `types.ts` | SmartBill response shapes |
| `reconcile.ts` | Pure planning logic — what to create/update, and why |
| `../../workflows/sync-smartbill-inventory.ts` | The workflow |
| `../../jobs/smartbill-inventory-sync.ts` | Scheduled job |
| `../../api/admin/smartbill-sync/` | Manual trigger + config report |
| `../../scripts/smartbill-sync.ts` | CLI entry point |

`reconcile.ts` holds all the decision-making and has no Medusa dependencies,
which is what `reconcile.spec.ts` exercises.

## The audit page

`Setări → Verificare SmartBill` in the admin lists only the variants that need
a decision, grouped by what is wrong with them:

| Kind | Meaning | Fixable from the page |
| --- | --- | --- |
| `missing_sku` | No SKU at all, so it can never match | yes |
| `not_in_smartbill` | Has a SKU, but SmartBill has no such code | yes |
| `no_level` | Matched, but no inventory level exists yet | no — run the sync |
| `drift` | Matched, but the quantities disagree | no — run the sync |

For the two fixable kinds the page proposes SmartBill codes, ranked by two
independent signals (`lib/smartbill/suggest.ts`):

- **name** — token overlap between the two catalogue names, with numbers
  weighted double, because in packaging the dimensions are what identify the
  item.
- **code** — how close a SmartBill code is to the SKU already on the variant.
  A code that is the SKU minus a trailing digit scores highest.

A candidate backed by both signals outranks one backed by either alone. A code
matched only by digits, with a name that says otherwise, is damped — in a
catalogue of sequential codes, plenty of unrelated products sit one digit
apart.

### Suggestions marked "indisponibil"

Medusa enforces unique SKUs. When the obvious SmartBill code is already held by
another variant, the page shows it but will not apply it, and names the holder.

That situation is common here and is **not** a typo: pairs like *Cutie
prăjituri "Pastry" 13x10xH8 K2* and *Cutie prăjituri chocolate 13x10xH8 K2*
both correspond to a single SmartBill product, so only one of them can carry
the real code. Resolving it is a catalogue decision — merge the two products,
or ask for a separate code in SmartBill — not something the page should guess
at.
