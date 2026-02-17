import Link from "next/link"
import { FiPlus } from "react-icons/fi"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { getProductsPaginated } from "@/lib/products"
import { ProductsList } from "@/components/ProductsList"

type Props = {
  searchParams: Promise<{ page?: string; perPage?: string; search?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const perPage = Math.max(
    1,
    Math.min(
      100,
      parseInt(params.perPage || String(DEFAULT_PAGE_SIZE), 10) ||
        DEFAULT_PAGE_SIZE
    )
  )
  const search = params.search?.trim() || ""

  const { data: products, meta } = await getProductsPaginated(
    page,
    perPage,
    search || undefined
  )

  return (
    <div className="flex h-full flex-1 flex-col gap-4 bg-[#F8F9FB] pb-3 sm:h-full sm:gap-6 sm:pb-8 sm:pr-5 sm:pt-5 sm:max-md:pl-5">
      <div className="hidden items-center justify-between sm:flex">
        <h1 className="text-xl font-semibold text-[#3F3F46]">Товари</h1>

        <Link
          href="/products/new"
          className="flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[#F8F9FB] hover:bg-[#3A72ED]"
        >
          <FiPlus size={16} strokeWidth={3} className="text-[#F8F9FB]" />
          <p className="text-sm font-medium text-[#F8F9FB]">Додати</p>
        </Link>
      </div>

      <ProductsList products={products} meta={meta} currentSearch={search} />
    </div>
  )
}
