import { getCollectionByHandle } from "@lib/data/collections"
import { getProductsList } from "@lib/data/products"
import CollectionSlider from "./index"

type CollectionSliderServerProps = {
  handle: string
  title: string
  countryCode: string
}

export default async function CollectionSliderServer({
  handle,
  title,
  countryCode,
}: CollectionSliderServerProps) {
  const collection = await getCollectionByHandle(handle)

  if (!collection) return null

  const { response } = await getProductsList({
    queryParams: {
      collection_id: [collection.id],
      limit: 20,
      order: "-created_at",
    },
    countryCode,
  })

  if (!response.products.length) return null

  return (
    <CollectionSlider
      title={title}
      products={response.products}
      handle={handle}
    />
  )
}
