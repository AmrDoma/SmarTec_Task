import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

type PaginationProps = {
  page: number
  totalPages: number
  count: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function getPageNumbers(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>()
  pages.add(1)
  pages.add(totalPages)
  for (let i = page - 1; i <= page + 1; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | '…')[] = []
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    const prev = sorted[i - 1]
    if (i > 0 && current - prev > 1) result.push('…')
    result.push(current)
  }
  return result
}

export function Pagination({
  page,
  totalPages,
  count,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pages = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages],
  )

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground sm:justify-start">
        <span>{count} total</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="cursor-pointer rounded-md border border-border bg-card px-2 py-1.5 text-foreground"
          aria-label="Rows per page"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-center gap-1 sm:justify-end">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="min-w-[4.5rem] px-2 text-center text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((item, index) =>
            item === '…' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-2 text-sm transition-colors ${
                  item === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card hover:bg-muted'
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
