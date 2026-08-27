/**
 * A guide is an ordered checklist for one task an operator actually performs.
 *
 * Step wording quotes the button labels exactly as they appear in the admin —
 * including the awkward ones from Medusa's shipped Romanian, such as
 * "Creați împlinire" — so a reader can match text on screen. The plain-language
 * explanation goes in `detail`, not in place of the label.
 */
export type GuideStep = {
  /** Stable within a guide; used as the localStorage key for "done". */
  id: string
  title: string
  detail?: string
  /** Shown as a highlighted aside — the thing people get wrong. */
  warning?: string
}

export type Guide = {
  id: string
  title: string
  summary: string
  /** Emoji used as a small visual anchor in the list. */
  icon: string
  steps: GuideStep[]
}
