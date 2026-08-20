import React from "react"
import { Callout, Hint, INPUT, INPUT_DISABLED, noScrollNumber } from "./ui"
import { resolveTierValue, type WizardDraft } from "./save-plan"
import type { Variant } from "./use-product-settings"

type TierKey = keyof WizardDraft["tiers"]

const TIER_META: { key: TierKey; title: string; help: string }[] = [
  { key: "t1_9", title: "1 – 9 bucăți", help: "Prețul pentru cumpărături mici" },
  { key: "t10_24", title: "10 – 24 bucăți", help: "Preț pentru cantitate medie" },
  { key: "t25", title: "25 bucăți sau mai multe", help: "Preț pentru cantitate mare" },
]

/**
 * Step 2 — prices per quantity band.
 * Fields arrive pre-filled with what is already stored, so this reads as
 * editing rather than re-entering.
 */
export const StepPrices = ({
  variants,
  variantId,
  onSelectVariant,
  tiers,
  setTiers,
  markTouched,
}: {
  variants: Variant[]
  variantId: string
  onSelectVariant: (id: string) => void
  tiers: WizardDraft["tiers"]
  setTiers: React.Dispatch<React.SetStateAction<WizardDraft["tiers"]>>
  markTouched: () => void
}) => {
  const update = (key: TierKey, patch: Partial<WizardDraft["tiers"][TierKey]>) => {
    setTiers((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
    markTouched()
  }

  const values = TIER_META.map((meta) => resolveTierValue(tiers[meta.key]))
  const active = values.filter((v): v is number => v !== null)
  const notDescending = active.length > 1 && active.some((v, i) => i > 0 && v > active[i - 1])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium mb-1">
          Pentru care variantă?
        </label>
        <select
          className={INPUT}
          value={variantId}
          onChange={(e) => onSelectVariant(e.target.value)}
        >
          <option value="">Alege o variantă…</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
        <Hint>
          Prețurile se setează separat pentru fiecare variantă (mărime, model etc.).
        </Hint>
      </div>

      {!variantId && (
        <Callout tone="info">
          Alege o variantă mai sus ca să vezi și să modifici prețurile.
        </Callout>
      )}

      {variantId && (
        <>
          <div className="flex flex-col gap-3">
            {TIER_META.map((meta) => {
              const tier = tiers[meta.key]
              return (
                <div
                  key={meta.key}
                  className={`rounded-md border border-gray-200 dark:border-gray-700 p-3 ${
                    tier.enabled ? "" : "opacity-60"
                  }`}
                >
                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tier.enabled}
                      onChange={(e) =>
                        update(meta.key, {
                          enabled: e.target.checked,
                          typed: e.target.checked ? tier.typed : "",
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    />
                    <span className="text-sm font-medium">{meta.title}</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={INPUT_DISABLED}
                      value={tier.typed}
                      disabled={!tier.enabled}
                      onWheel={noScrollNumber}
                      onChange={(e) => update(meta.key, { typed: e.target.value })}
                      placeholder={
                        tier.enabled
                          ? tier.existing || "Scrie prețul"
                          : "Fără preț pentru această cantitate"
                      }
                    />
                    <span className="text-sm text-gray-500 shrink-0">RON</span>
                  </div>

                  <Hint>
                    {tier.enabled
                      ? tier.existing
                        ? `${meta.help}. Acum este ${tier.existing} RON — lasă gol ca să rămână neschimbat.`
                        : `${meta.help}. Nu are încă un preț setat.`
                      : "Debifat: acest preț va fi șters la salvare."}
                  </Hint>
                </div>
              )
            })}
          </div>

          {notDescending && (
            <Callout tone="warn">
              Atenție: de obicei prețul scade când se cumpără mai mult. Aici un
              prag mai mare are preț mai mare. Poți continua oricum dacă așa
              vrei.
            </Callout>
          )}

          {active.length === 0 && (
            <Callout tone="warn">
              Toate pragurile sunt debifate, deci nu se va salva niciun preț
              pentru această variantă.
            </Callout>
          )}
        </>
      )}
    </div>
  )
}
