import { useCallback, useEffect, useState } from "react"

/**
 * Per-browser checklist progress.
 *
 * Deliberately localStorage rather than server state: a half-finished
 * checklist is a personal scratchpad, not shop data, and it should never be
 * something one operator can wipe for another. Every access is guarded —
 * storage throws in private windows and when site data is blocked.
 */
const key = (guideId: string) => `guide:${guideId}:done`

const read = (guideId: string): string[] => {
  try {
    const raw = window.localStorage.getItem(key(guideId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []
  } catch {
    return []
  }
}

const write = (guideId: string, done: string[]) => {
  try {
    window.localStorage.setItem(key(guideId), JSON.stringify(done))
  } catch {
    // Progress is a convenience; losing it must never break the page.
  }
}

export const useGuideProgress = (guideId: string) => {
  const [done, setDone] = useState<string[]>([])

  // Read after mount so the first render matches on any storage state.
  useEffect(() => {
    setDone(read(guideId))
  }, [guideId])

  const toggle = useCallback(
    (stepId: string) => {
      setDone((prev) => {
        const next = prev.includes(stepId)
          ? prev.filter((id) => id !== stepId)
          : [...prev, stepId]
        write(guideId, next)
        return next
      })
    },
    [guideId]
  )

  const reset = useCallback(() => {
    setDone([])
    write(guideId, [])
  }, [guideId])

  return { done, toggle, reset }
}
