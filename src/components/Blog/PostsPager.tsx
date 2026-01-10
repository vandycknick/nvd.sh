import { clamp } from "@/utils"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Props = {
  total: number
  currentPage: number
  className: string
}

const getBlogUrl = (page: number) => (page === 1 ? "/blog" : `/blog/${page}`)

export const PostsPager = ({ total, currentPage, className }: Props) => {
  const previous = clamp(currentPage - 1, 1, total)
  const next = clamp(currentPage + 1, 1, total)
  const pages = Array.from({ length: total }, (v, i) => i + 1)

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={getBlogUrl(previous)}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={
              currentPage <= 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={getBlogUrl(page)}
              isActive={currentPage === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={getBlogUrl(next)}
            aria-disabled={currentPage >= total}
            tabIndex={currentPage >= total ? -1 : undefined}
            className={
              currentPage >= total
                ? "pointer-events-none opacity-50"
                : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
