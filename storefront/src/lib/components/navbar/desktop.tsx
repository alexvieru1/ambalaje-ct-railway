"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { IconSearch, IconShoppingCart, IconUser } from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"
import { StoreProductCategory } from "@medusajs/types"
import { Logo } from "../logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  categories: StoreProductCategory[]
}

export const DesktopNavbar = ({ categories }: Props) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] =
    useState<StoreProductCategory | null>(null)

  const topLevelCategories = categories.filter((cat) => !cat.parent_category)

  const generalPages = [
    { title: "Acasă", path: "/" },
    { title: "Produse", path: "/produse" },
    { title: "Despre noi", path: "/despre-noi" },
    { title: "Contact", path: "/contact" },
  ]

  useEffect(() => {
    setIsOpen(false)
    setActiveCategory(null)
  }, [pathname])

  const handleToggleMenu = () => {
    setIsOpen((prev) => {
      const newState = !prev
      if (newState && categories.length > 0) {
        setActiveCategory(categories[0])
      }
      return newState
    })
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">
      <div className="hidden md:flex justify-between items-center px-6 py-4">
        {/* LEFT: Logo + Menu toggle */}
        <div className="flex items-center gap-4 2xl:ml-20">
          <button
            onClick={handleToggleMenu}
            className="text-black"
            aria-label="Toggle menu"
          >
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              animate={isOpen ? "open" : "closed"}
              initial={false}
            >
              <motion.path
                strokeWidth="2"
                stroke="currentColor"
                strokeLinecap="round"
                variants={{
                  closed: { d: "M 2 5 L 22 5" },
                  open: { d: "M 4 4 L 20 20" },
                }}
              />
              <motion.path
                strokeWidth="2"
                stroke="currentColor"
                strokeLinecap="round"
                variants={{
                  closed: { d: "M 2 12 L 22 12", opacity: 1 },
                  open: { opacity: 0 },
                }}
                transition={{ duration: 0.1 }}
              />
              <motion.path
                strokeWidth="2"
                stroke="currentColor"
                strokeLinecap="round"
                variants={{
                  closed: { d: "M 2 19 L 22 19" },
                  open: { d: "M 4 20 L 20 4" },
                }}
              />
            </motion.svg>
          </button>
          <LocalizedClientLink href="/search">
            <IconSearch />
          </LocalizedClientLink>
        </div>

        {/* CENTER: Search */}
        <div className="flex-1 flex justify-center px-4">
          <Logo />
        </div>

        {/* RIGHT: Cart + Account */}
        <div className="ml-auto flex gap-6 items-center 2xl:mr-20">
          <LocalizedClientLink
            href="/account"
            className="flex items-center justify-center text-sm text-gray-700 hover:text-[#44b74a] transition"
          >
            <IconUser className="w-6 h-6" />
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/cart"
            className="flex items-center justify-center text-sm text-gray-700 hover:text-[#44b74a] transition"
          >
            <IconShoppingCart className="w-6 h-6" />
          </LocalizedClientLink>
        </div>
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block bg-white border-t shadow-md w-full"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-3 gap-8">
              {/* GENERAL */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-900">
                  General
                </h4>
                <ul className="space-y-2">
                  {generalPages.map((page) => (
                    <li key={page.title}>
                      <LocalizedClientLink
                        href={page.path}
                        className="text-gray-700 hover:text-[#44b74a]"
                      >
                        {page.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CATEGORIES */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-900">
                  Categorii
                </h4>
                <ul className="space-y-2">
                  {topLevelCategories.map((cat) => (
                    <li key={cat.id}>
                      <LocalizedClientLink
                        href={`/produse/${cat.handle}`}
                        onMouseEnter={() => setActiveCategory(cat)}
                        onFocus={() => setActiveCategory(cat)}
                        className={`block text-gray-700 hover:text-[#44b74a] transition ${
                          activeCategory?.id === cat.id ? "text-[#44b74a]" : ""
                        }`}
                      >
                        {cat.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SUBCATEGORIES */}
              <div>
                <AnimatePresence mode="wait">
                  {activeCategory &&
                    Array.isArray(activeCategory.category_children) &&
                    activeCategory.category_children.length > 0 && (
                      <motion.div
                        key={activeCategory.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 className="text-sm font-semibold mb-3 text-gray-900">
                          {activeCategory.name}
                        </h4>
                        <ul className="space-y-2">
                          {activeCategory.category_children.map((child) => (
                            <li key={child.id}>
                              <LocalizedClientLink
                                href={`/produse/${activeCategory.handle}/${child.handle}`}
                                className="text-gray-700 hover:text-[#44b74a]"
                              >
                                {child.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
