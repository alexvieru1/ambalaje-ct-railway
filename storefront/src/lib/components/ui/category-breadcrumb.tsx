"use client"


import { HttpTypes } from "@medusajs/types"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "./breadcrumb"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  category?: HttpTypes.StoreProductCategory
}

export function CategoryBreadcrumb({ category }: Props) {
  if (!category) return null

  const breadcrumbs: { name: string; href: string }[] = []

  let current = category
  while (current?.parent_category) {
    breadcrumbs.unshift({
      name: current.parent_category.name,
      href: `/produse/${current.parent_category.handle}`,
    })
    current = current.parent_category
  }
  

  return (
    <Breadcrumb className="mb-6 text-sm text-muted-foreground list-none flex items-center gap-1">
      {/* Produse root */}
      <BreadcrumbItem className="list-none">
        <BreadcrumbLink asChild>
          <LocalizedClientLink href="/produse" className="hover:text-[#44b74a]">
            Produse
          </LocalizedClientLink>
        </BreadcrumbLink>
      </BreadcrumbItem>

      {breadcrumbs.map((crumb) => (
        <span className="flex items-center gap-1" key={crumb.href}>
          <BreadcrumbSeparator>/ </BreadcrumbSeparator>
          <BreadcrumbItem className="list-none">
            <BreadcrumbLink asChild>
              <LocalizedClientLink
                href={crumb.href}
                className="hover:text-[#44b74a] capitalize"
              >
                {crumb.name}
              </LocalizedClientLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </span>
      ))}

      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem className="list-none">
        <BreadcrumbLink asChild aria-current="page">
          <LocalizedClientLink
            href={`/produse/${category.handle}`}
            className="capitalize font-semibold text-foreground"
          >
            {category.name}
          </LocalizedClientLink>
        </BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  )
}
