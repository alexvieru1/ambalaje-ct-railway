import { defineRouteConfig } from "@medusajs/admin-sdk"
import React from "react"
import { GUIDES } from "../../../components/guides/guides-data"
import { GuidePanel } from "../../../components/guides/guide-panel"

const GuidesPage = () => (
  <div className="flex max-w-3xl flex-col gap-6 pb-12">
    <div>
      <h1 className="text-xl font-semibold">Ghiduri</h1>
      <p className="mt-1 text-sm text-gray-500">
        Pașii de urmat pentru operațiunile de zi cu zi. Bifați pe măsură ce
        avansați — bifele rămân salvate pe acest calculator, ca să puteți relua
        de unde ați rămas.
      </p>
    </div>

    <div className="flex flex-col gap-3">
      {GUIDES.map((guide) => (
        <GuidePanel key={guide.id} guide={guide} />
      ))}
    </div>

    <p className="text-xs text-gray-500">
      Ghidurile potrivite apar și direct în paginile de comenzi și produse, ca
      să nu fie nevoie să reveniți aici.
    </p>
  </div>
)

export const config = defineRouteConfig({
  label: "Ghiduri",
})

export default GuidesPage
