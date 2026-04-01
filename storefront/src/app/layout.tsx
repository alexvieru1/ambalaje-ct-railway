import { Toaster } from "@lib/components/ui/sonner"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import GoogleAnalytics from "@modules/common/components/google-analytics"
import CookieConsent from "@modules/common/components/cookie-consent"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ro" data-mode="light">
      <body>
        <GoogleAnalytics />
        <main className="relative pt-16 lg:pt-20">{props.children}</main>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  )
}
