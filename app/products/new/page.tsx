import { ProductForm } from "@/components/ProductForm"

export default function NewProductPage() {
  return (
    <div className="flex h-full w-full justify-center bg-[#F8F9FB] p-0 pb-4 sm:p-5 sm:pb-8">
      <ProductForm mode="create" />
    </div>
  )
}
