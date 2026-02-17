import { FiSearch } from "react-icons/fi"
import { FaXmark } from "react-icons/fa6"
import { Input } from "./ui/input"

type Props = {
  query: string
  setQuery: (query: string) => void
}

export function SearchInput({ query, setQuery }: Props) {
  return (
    <>
      <label htmlFor="products-search" className="sr-only">
        Пошук товарів за назвою або описом
      </label>
      <FiSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
        size={16}
      />
      <div className="group/field w-full">
        <Input
          id="products-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук товару"
          className="w-full rounded-md border border-[#E4E4E7] bg-white py-2.5 pl-8 pr-4 text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0 disabled:opacity-50 group-hover/field:border-[#2563EB]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-[#18181B] group-hover/field:border-[#2563EB]"
            aria-label="Очистити пошук"
          >
            <FaXmark size={16} />
          </button>
        )}
      </div>
    </>
  )
}
