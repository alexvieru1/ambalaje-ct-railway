//   src/app/[countryCode]/(main)/produse/page.tsx
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Produse | Ambalaje Constanța",
  description: "Descoperă gama noastră de ambalaje ecologice și consumabile.",
}

export default async function ProdusePage({
  params,
}: {
  params: { countryCode: string }
}) {
  /* category data need NOT be region-aware */
  const allCategories = await listCategories()
  const top = allCategories.filter((c) => c.parent_category === null)

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Categorii de produse</h1>

      {top.length === 0 ? (
        <p>Nu am găsit categorii de produse.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {top.map((cat) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/produse/${cat.handle}`}
              className="group block border rounded-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                Imagine categorie
              </div>
              <div className="p-3 text-center">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#44b74a] transition">
                  {cat.name}
                </h3>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      )}
    </section>
  )
}
