import React, { useState } from "react"
import { BTN_GHOST } from "../product-settings/ui"
import type { Guide } from "./types"
import { useGuideProgress } from "./use-guide-progress"

/**
 * One guide rendered as a collapsible checklist.
 *
 * Collapsed by default when embedded next to a page: someone who already
 * knows the job should not have to scroll past instructions every time.
 */
export const GuidePanel = ({
  guide,
  defaultOpen = false,
}: {
  guide: Guide
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)
  const { done, toggle, reset } = useGuideProgress(guide.id)

  const completed = guide.steps.filter((step) => done.includes(step.id)).length
  const total = guide.steps.length
  const allDone = completed === total

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span aria-hidden className="text-xl">
          {guide.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{guide.title}</span>
          <span className="mt-0.5 block text-xs text-gray-500">{guide.summary}</span>
        </span>
        <span
          className={`shrink-0 rounded px-2 py-1 text-xs font-medium tabular-nums ${
            allDone
              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {completed}/{total}
        </span>
        <span aria-hidden className="shrink-0 text-gray-400">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-200 px-4 pb-4 dark:border-gray-700">
          <ol className="mt-3 flex flex-col gap-3">
            {guide.steps.map((step, index) => {
              const checked = done.includes(step.id)
              return (
                <li key={step.id} className="flex gap-3">
                  <span className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(step.id)}
                      aria-label={`Pasul ${index + 1}: ${step.title}`}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-gray-600"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm ${
                        checked
                          ? "text-gray-400 line-through dark:text-gray-500"
                          : "font-medium"
                      }`}
                    >
                      {index + 1}. {step.title}
                    </span>
                    {step.detail && !checked && (
                      <span className="mt-0.5 block text-xs text-gray-500">
                        {step.detail}
                      </span>
                    )}
                    {step.warning && !checked && (
                      <span className="mt-1.5 block rounded border border-yellow-200 bg-yellow-50 px-2 py-1.5 text-xs text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300">
                        {step.warning}
                      </span>
                    )}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              {allDone
                ? "Gata — ați parcurs toți pașii."
                : "Bifele sunt doar pentru dumneavoastră, pe acest calculator."}
            </p>
            {completed > 0 && (
              <button type="button" className={BTN_GHOST} onClick={reset}>
                Șterge bifele
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
