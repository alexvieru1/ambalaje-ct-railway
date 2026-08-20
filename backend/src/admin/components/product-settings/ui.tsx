import React from "react"

export const INPUT =
  "w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-900 " +
  "border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"

export const INPUT_DISABLED = `${INPUT} disabled:bg-gray-100 disabled:cursor-not-allowed`

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 " +
  "text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"

export const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 " +
  "dark:border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 " +
  "disabled:opacity-50 disabled:cursor-not-allowed"

export const BTN_DASHED =
  "w-full rounded-md border border-dashed border-gray-300 dark:border-gray-700 " +
  "px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600"

/** Disable scroll-to-change on number inputs, which silently corrupts values. */
export const noScrollNumber = (e: React.WheelEvent<HTMLInputElement>) => {
  ;(e.target as HTMLInputElement).blur()
}

/** Plain-language hint shown under a field. */
export const Hint = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-gray-500 mt-1">{children}</p>
)

export const Callout = ({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error"
  children: React.ReactNode
}) => {
  const tones = {
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    warn: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
    error:
      "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
  }
  return (
    <div className={`rounded-md border p-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  )
}
