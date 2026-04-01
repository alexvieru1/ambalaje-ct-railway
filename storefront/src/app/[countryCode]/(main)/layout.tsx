import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import { getBaseURL } from "@lib/util/env"
import Navbar from "@lib/components/navbar"
import StructuredData from "@modules/common/components/structured-data"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData />
      <Navbar />
      {props.children}
      <Footer />
    </>
  )
}
