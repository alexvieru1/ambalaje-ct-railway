// components/ui/pagination-wrapper.tsx

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Pagination, PaginationContent, PaginationItem } from "./pagination"
import { PaginationLink } from "./pagination-link"

type Props = {
  currentPage: number
  totalPages: number
  basePath: string
}

export function PaginationWrapper({ currentPage, totalPages, basePath }: Props) {
  return (
    <Pagination>
      <PaginationContent className="justify-center mt-6">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1
          const isActive = pageNum === currentPage
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink asChild isActive={isActive}>
                <LocalizedClientLink href={`${basePath}?page=${pageNum}`}>
                  {pageNum}
                </LocalizedClientLink>
              </PaginationLink>
            </PaginationItem>
          )
        })}
      </PaginationContent>
    </Pagination>
  )
}
