"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StoreProductCategory } from "@medusajs/types"

import {
  IconChevronDown,
  IconSearch,
  IconShoppingCart,
  IconUser,
} from "@tabler/icons-react"
import { Logo } from "../logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Path = (props: any) => (
  <motion.path
    fill="transparent"
    strokeWidth="2"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  />
)

type Props = {
  categories: StoreProductCategory[]
}

const MobileNavbar = ({ categories }: Props) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const topLevelCategories = categories.filter((cat) => !cat.parent_category)

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // Auto-close both dropdowns on route change
  useEffect(() => {
    setIsOpen(false)
    setOpenMenus([])
  }, [pathname])

  return (
    <div className="fixed top-0 left-0 right-0 md:hidden px-4 py-3 flex items-center justify-between border-b z-50 bg-white">
      {/* LEFT: Burger + Search */}
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            animate={isOpen ? "open" : "closed"}
            initial={false}
          >
            <Path
              variants={{
                closed: { d: "M 2 5 L 22 5" },
                open: { d: "M 4 4 L 20 20" },
              }}
            />
            <Path
              variants={{
                closed: { d: "M 2 12 L 22 12", opacity: 1 },
                open: { opacity: 0 },
              }}
              transition={{ duration: 0.1 }}
            />
            <Path
              variants={{
                closed: { d: "M 2 19 L 22 19" },
                open: { d: "M 4 20 L 20 4" },
              }}
            />
          </motion.svg>
        </button>
        <LocalizedClientLink href="/search">
          <IconSearch className="w-6 h-6" />
        </LocalizedClientLink>
      </div>

      {/* CENTER: Logo */}
      <Logo />

      {/* RIGHT: Account + Cart */}
      <div className="flex gap-4 items-center">
        <LocalizedClientLink href="/account" aria-label="Account">
          <IconUser className="w-6 h-6 text-gray-600" />
        </LocalizedClientLink>
        <LocalizedClientLink href="/cart" aria-label="Cart">
          <IconShoppingCart className="w-6 h-6 text-gray-600" />
        </LocalizedClientLink>
      </div>

      {/* MENU DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full bg-white border-t shadow-md z-40"
          >
            <div className="flex flex-col p-4 space-y-4 max-h-[calc(100vh-60px)] overflow-y-auto">
              {topLevelCategories.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <LocalizedClientLink
                      href={`/produse/${cat.handle}`}
                      className="text-sm font-medium text-gray-800"
                    >
                      {cat.name}
                    </LocalizedClientLink>
                    {cat.category_children?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleMenu(cat.id)}
                        className="text-gray-600"
                        aria-label={`Toggle ${cat.name}`}
                      >
                        <IconChevronDown
                          className={`w-4 h-4 transition-transform ${
                            openMenus.includes(cat.id) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  <AnimatePresence initial={false}>
                    {openMenus.includes(cat.id) &&
                      cat.category_children?.map((sub) => (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="ml-4"
                        >
                          <LocalizedClientLink
                            href={`/produse/${cat.handle}/${sub.handle}`}
                            className="block text-sm text-muted-foreground hover:underline"
                          >
                            {sub.name}
                          </LocalizedClientLink>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MobileNavbar
