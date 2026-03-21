import { Metadata } from "next"

import CollectionSliderServer from "@modules/home/components/collection-slider/server"
import CoreValues from "@modules/home/components/core-values"
import FeaturedProducts from "@modules/home/components/featured-products"
import OffersSlideshow from "@modules/home/components/offers-slideshow"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Ambalaje Constanța - Soluții Complete de Ambalare",
  description:
    "Ambalaje de calitate pentru afacerea ta. Cutii de carton, pungi, folie stretch și multe altele. Livrare rapidă în Constanța și în toată țara.",
}

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <OffersSlideshow />
      <CoreValues />
      <CollectionSliderServer
        handle="adaugate-recent"
        title="Adăugate recent"
        countryCode={countryCode}
      />
      <CollectionSliderServer
        handle="cele-mai-vandute"
        title="Cele mai vândute"
        countryCode={countryCode}
      />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
