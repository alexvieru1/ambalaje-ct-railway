import type { MetadataRoute } from "next"

import { sdk } from "@lib/config"
import { DEFAULT_COUNTRY_CODE, SITE_URL } from "@lib/util/site-url"

// Rebuilt at most once an hour, so new products show up without a redeploy.
export const revalidate = 3600

const PAGE_SIZE = 100

interface HandleRecord {
  handle?: string | null
  updated_at?: string | Date | null
}

const STATIC_PATHS: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}> = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/produse", priority: 0.9, changeFrequency: "daily" },
  { path: "/store", priority: 0.8, changeFrequency: "daily" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/despre-noi", priority: 0.5, changeFrequency: "monthly" },
  { path: "/content/terms-of-use", priority: 0.2, changeFrequency: "yearly" },
  { path: "/content/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/content/cookies", priority: 0.2, changeFrequency: "yearly" },
]

const pageUrl = (path: string) => `${SITE_URL}/${DEFAULT_COUNTRY_CODE}${path}`

const toDate = (value: HandleRecord["updated_at"]) =>
  value ? new Date(value) : undefined

async function listAllProducts(): Promise<HandleRecord[]> {
  const products: HandleRecord[] = []
  let offset = 0

  // Paginate until the backend reports no more rows.
  for (;;) {
    const { products: page, count } = await sdk.store.product.list(
      { fields: "handle,updated_at", limit: PAGE_SIZE, offset }
    )
    products.push(...page)
    offset += page.length
    if (page.length === 0 || offset >= count) break
  }

  return products
}

async function listAllCategories(): Promise<HandleRecord[]> {
  const { product_categories } = await sdk.store.category.list(
    // @ts-ignore -- the SDK's query type omits limit/fields for categories
    { fields: "handle,updated_at", limit: 1000 }
  )
  return product_categories
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority, changeFrequency }) => ({
      url: pageUrl(path),
      changeFrequency,
      priority,
    })
  )

  // Products and categories share the /produse/<handle> route. If the backend
  // is unreachable (e.g. during the build), still serve the static pages.
  const [products, categories] = await Promise.all([
    listAllProducts().catch(() => [] as HandleRecord[]),
    listAllCategories().catch(() => [] as HandleRecord[]),
  ])

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...categories.map((c) => ({ ...c, priority: 0.7 })),
    ...products.map((p) => ({ ...p, priority: 0.6 })),
  ]
    .filter((record) => Boolean(record.handle))
    .map((record) => ({
      url: pageUrl(`/produse/${record.handle}`),
      lastModified: toDate(record.updated_at),
      changeFrequency: "weekly" as const,
      priority: record.priority,
    }))

  return [...staticEntries, ...dynamicEntries]
}
