import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { IconArrowRight } from "@tabler/icons-react"

const gradients = [
  { bg: "from-amber-600 to-orange-700", accent: "bg-amber-400/20" },
  { bg: "from-emerald-600 to-teal-700", accent: "bg-emerald-400/20" },
  { bg: "from-violet-600 to-purple-700", accent: "bg-violet-400/20" },
  { bg: "from-sky-600 to-blue-700", accent: "bg-sky-400/20" },
  { bg: "from-rose-600 to-pink-700", accent: "bg-rose-400/20" },
  { bg: "from-cyan-600 to-teal-700", accent: "bg-cyan-400/20" },
  { bg: "from-indigo-600 to-blue-800", accent: "bg-indigo-400/20" },
  { bg: "from-lime-600 to-green-700", accent: "bg-lime-400/20" },
]

export default async function CategoriesOverview() {
  const categories = await listCategories()

  const topLevel = categories
    .filter((cat) => !cat.parent_category)
    .sort((a, b) => {
      const rankA =
        typeof a.rank === "number" ? a.rank : Number.MAX_SAFE_INTEGER
      const rankB =
        typeof b.rank === "number" ? b.rank : Number.MAX_SAFE_INTEGER
      return rankA - rankB
    })

  if (!topLevel.length) return null

  return (
    <section className="content-container py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-ui-fg-base">
          Categorii de produse
        </h2>
        <LocalizedClientLink
          href="/produse"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#44b74a] hover:text-[#3a9e3f] transition-colors"
        >
          Vezi toate produsele
          <IconArrowRight size={16} stroke={2} />
        </LocalizedClientLink>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topLevel.map((category, index) => {
          const gradient = gradients[index % gradients.length]
          const childCount = category.category_children?.length ?? 0

          return (
            <LocalizedClientLink
              key={category.id}
              href={`/produse/${category.handle}`}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient.bg} p-6 min-h-[160px] md:min-h-[200px] flex flex-col justify-end transition-transform hover:scale-[1.02]`}
            >
              {/* Decorative shapes */}
              <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
                <div className="absolute -top-6 -right-6 w-28 h-28 border-[3px] border-white rounded-full" />
                <div className="absolute bottom-4 -left-4 w-20 h-20 border-[3px] border-white rounded-full" />
                <div className="absolute top-1/3 right-1/4 w-10 h-10 border-[3px] border-white rotate-45" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {childCount > 0 && (
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium text-white/90 bg-white/15 rounded-full mb-3 backdrop-blur-sm">
                    {childCount}{" "}
                    {childCount === 1 ? "subcategorie" : "subcategorii"}
                  </span>
                )}
                <h3 className="text-base md:text-lg font-bold text-white leading-snug">
                  {category.name}
                </h3>
              </div>

              {/* Hover arrow */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconArrowRight size={20} stroke={2} className="text-white" />
              </div>
            </LocalizedClientLink>
          )
        })}
      </div>

      <LocalizedClientLink
        href="/produse"
        className="sm:hidden flex items-center justify-center gap-1.5 mt-6 text-sm font-medium text-[#44b74a] hover:text-[#3a9e3f] transition-colors"
      >
        Vezi toate produsele
        <IconArrowRight size={16} stroke={2} />
      </LocalizedClientLink>
    </section>
  )
}
