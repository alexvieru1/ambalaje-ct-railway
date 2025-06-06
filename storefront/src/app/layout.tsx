import { Toaster } from "@lib/components/ui/sonner"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative pt-20 lg:pt-24">{props.children}</main>
        <Toaster />
      </body>
    </html>
  )
}
