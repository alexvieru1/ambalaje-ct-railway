//   src/app/[countryCode]/(main)/produse/[...slug]/page.tsx
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getRegion } from "@lib/data/regions";
import { getProductByHandle, getProductsList } from "@lib/data/products";
import { getCategoryByHandle } from "@lib/data/categories";
import { CategoryBreadcrumb } from "@lib/components/ui/category-breadcrumb";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { ProductCard } from "@lib/components/product/product-card";
import { PaginationWrapper } from "@lib/components/ui/pagination-wrapper";
import { ProductPage } from "@lib/components/product/product-page";


type Props = {
  params: { countryCode: string; slug: string[] }
  searchParams?: { page?: string }
}

export const dynamic = "force-dynamic"

/* ───────────── 1.  Metadata ───────────── */
export async function generateMetadata({
  params,
}: {
  params: { countryCode: string; slug: string[] }
}): Promise<Metadata> {
  const { countryCode, slug } = params
  const handle   = slug[slug.length - 1] || ""
  const region   = await getRegion(countryCode)

  /* product? */
  if (region) {
    const product = await getProductByHandle(handle, region.id)
    if (product) {
      const metaTitle =
        typeof product.metadata?.meta_title === "string"
          ? product.metadata.meta_title
          : undefined

      const metaDescription =
        typeof product.metadata?.meta_description === "string"
          ? product.metadata.meta_description
          : undefined

      return {
        title:  metaTitle || `${product.title} | Ambalaje Constanța`,
        description: metaDescription || product.description || "",
        openGraph: {
          title:       metaTitle || product.title,
          description: metaDescription || product.description || "",
          images:      product.thumbnail ? [product.thumbnail] : [],
        },
      }
    }
  }

  /* category? */
  const category = await getCategoryByHandle([handle])
  if (category) {
    return {
      title: `${category.name} | Ambalaje Constanța`,
      description:
        typeof category.description === "string"
          ? category.description
          : `Vezi produsele din categoria ${category.name}.`,
    }
  }

  /* fallback */
  return {
    title: "Produse | Ambalaje Constanța",
    description:
      "Descoperă gama noastră de ambalaje ecologice și consumabile.",
  }
}

/* ───────────── 2.  Page component ───────────── */
export default async function ProduseDynamicPage({
  params,
  searchParams,
}: Props) {
  const { countryCode, slug } = params
  const handle = slug[slug.length - 1] || ""
  const page   = Number(searchParams?.page ?? 1)

  /* get region once, reuse */
  const region = await getRegion(countryCode)

  const [category] = await Promise.all([
    getCategoryByHandle([handle]),
  ])

  const product =
    region ? await getProductByHandle(handle, region.id) : null

  /* ――― product detail ――― */
  if (product) {
    return (
      <ProductPage
        product={product}
        category={product.categories?.[0] || category || undefined}
      />
    )
  }

  /* 404 if neither product nor category */
  if (!category) notFound()

  /* ――― category listing ――― */
  const categoryChildren = (category.category_children || [])
    .slice()
    .sort((a, b) => {
      const rankA =
        typeof a.rank === "number" ? a.rank : Number.MAX_SAFE_INTEGER
      const rankB =
        typeof b.rank === "number" ? b.rank : Number.MAX_SAFE_INTEGER
      if (rankA !== rankB) return rankA - rankB
      return (a.name || "").localeCompare(b.name || "")
    })

  const hasChildren = categoryChildren.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 min-h-[80vh] flex flex-col">
      <CategoryBreadcrumb category={category} />

      {hasChildren ? (
        /* child categories */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categoryChildren.map((sub) => (
            <div
              key={sub.id}
              className="border rounded-md overflow-hidden text-center hover:shadow-md transition"
            >
              <LocalizedClientLink href={`/produse/${sub.handle}`}>
                <div className="relative h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  Imagine categorie
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 hover:text-[#44b74a] transition">
                    {sub.name}
                  </h3>
                </div>
              </LocalizedClientLink>
            </div>
          ))}
        </div>
      ) : (
        /* products in this category */
        <CategoryProductGrid
          categoryId={category.id}
          countryCode={countryCode}
          currentPage={page}
        />
      )}
    </div>
  )
}

/* ───────────── 3.  Grid helper ───────────── */
async function CategoryProductGrid({
  categoryId,
  countryCode,
  currentPage,
}: {
  categoryId: string
  countryCode: string
  currentPage: number
}) {
  const {
    response: { products, count },
  } = await getProductsList({
    pageParam: currentPage,
    countryCode,
    queryParams: {
      limit: 12,
      category_id: [categoryId],
    } as any,
  })

  if (!products.length) {
    return <p>Nu am găsit produse în această categorie.</p>
  }

  const totalPages = Math.ceil(count / 12)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            href={
              p.categories?.[0]?.handle
                ? `/produse/${p.categories[0].handle}/${p.handle}`
                : `/produse/${p.handle}`
            }
          />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/produse/${categoryId}`}
        />
      )}
    </>
  )
}
