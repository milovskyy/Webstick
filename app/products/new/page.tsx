import { ProductForm } from "@/components/ProductForm/ProductForm"

export default function NewProductPage() {
  return (
    <div className="flex h-full w-full justify-center bg-[#F8F9FB] p-0 pb-8 sm:p-5">
      <ProductForm mode="create" />
    </div>
  )
}
