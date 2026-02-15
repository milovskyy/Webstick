import { ProductsList } from "@/components/ProductsList"
import { getProducts } from "@/lib/products"
import Link from "next/link"
import { FiPlus } from "react-icons/fi"

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="flex h-full flex-col gap-6 bg-[#F8F9FB] pb-8 pl-0 pr-5 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#3F3F46]">Товари</h1>

        <Link
          href="/products/new"
          className="flex items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[#F8F9FB] hover:bg-[#3A72ED]"
        >
          <FiPlus size={16} strokeWidth={3} className="text-[#F8F9FB]" />
          <p className="text-sm font-medium text-[#F8F9FB]">Додати</p>
        </Link>
      </div>

      <ProductsList products={products} />
    </div>
  )
}
