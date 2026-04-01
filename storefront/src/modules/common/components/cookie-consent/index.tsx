"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CONSENT_KEY = "cookie-consent"

type ConsentValue = "accepted" | "rejected"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const handleConsent = (value: ConsentValue) => {
    localStorage.setItem(CONSENT_KEY, value)
    setVisible(false)

    if (value === "accepted") {
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
      })
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Folosim cookie-uri pentru a îmbunătăți experiența ta pe site.
          Consultă{" "}
          <LocalizedClientLink
            href="/content/cookies"
            className="underline hover:text-[#44b74a] transition-colors"
          >
            Politica de Cookies
          </LocalizedClientLink>{" "}
          pentru detalii.
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleConsent("rejected")}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-ui-fg-base hover:bg-gray-50 transition-colors"
          >
            Refuz
          </button>
          <button
            onClick={() => handleConsent("accepted")}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#44b74a] text-white hover:bg-[#3a9e3f] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
