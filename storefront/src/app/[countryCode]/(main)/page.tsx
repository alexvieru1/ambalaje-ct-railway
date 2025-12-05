import { Metadata } from "next"

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
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
