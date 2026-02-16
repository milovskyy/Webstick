"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FaAnglesLeft,
  FaAnglesRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6"

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const

type Props = {
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function ProductsPagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const isFirstPage = currentPage <= 1
  const isLastPage = totalPages <= 0 || currentPage >= totalPages

  return (
    <div className="mt-auto flex w-full flex-col flex-wrap items-center gap-3 sm:flex-row sm:justify-end sm:gap-12">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#3F3F46]">Рядки на сторінці</span>

        <Select onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-[65px] rounded-md border border-[#E4E4E7] bg-white text-[#18181B]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size.toString()} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[102px] text-center text-sm text-[#3F3F46]">
        Сторінки {currentPage} з {totalPages || 1}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          aria-label="На першу сторінку"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        >
          <FaAnglesLeft size={11} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Попередня сторінка"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        >
          <FaChevronLeft size={11} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Наступна сторінка"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        >
          <FaChevronRight size={11} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages || 1)}
          disabled={isLastPage}
          aria-label="На останню сторінку"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
        >
          <FaAnglesRight size={11} />
        </button>
      </div>
    </div>
  )
}
