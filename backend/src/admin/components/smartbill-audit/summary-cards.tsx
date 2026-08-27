import React from "react"
import type { AuditSummary, IssueKind } from "./types"
import { KIND_META } from "./types"

const Card = ({
  value,
  label,
  tone,
  active,
  onClick,
}: {
  value: number
  label: string
  tone: string
  active: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex flex-col items-start rounded-lg border p-3 text-left transition ${
      active
        ? "border-blue-500 ring-2 ring-blue-500/30"
        : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
    }`}
  >
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${tone}`}>
      {label}
    </span>
    <span className="mt-2 text-2xl font-semibold tabular-nums">{value}</span>
  </button>
)

const ORDER: IssueKind[] = ["missing_sku", "not_in_smartbill", "no_level", "drift"]

export const SummaryCards = ({
  summary,
  filter,
  onFilter,
}: {
  summary: AuditSummary
  filter: IssueKind | "all"
  onFilter: (kind: IssueKind | "all") => void
}) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
    <Card
      value={summary.in_sync}
      label="Corelate"
      tone="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
      active={filter === "all"}
      onClick={() => onFilter("all")}
    />
    {ORDER.map((kind) => (
      <Card
        key={kind}
        value={summary[kind]}
        label={KIND_META[kind].short}
        tone={KIND_META[kind].tone}
        active={filter === kind}
        onClick={() => onFilter(filter === kind ? "all" : kind)}
      />
    ))}
  </div>
)
