"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, Loader2, Save } from "lucide-react"
import type { ProductFormProps } from "../../lib/types"

type ProductFormHeaderProps = {
  mode: ProductFormProps["mode"]
  isSubmitting: boolean
  productTitle?: string | null
}

export function ProductFormHeader({
  mode,
  isSubmitting,
  productTitle,
}: ProductFormHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col max-sm:gap-1">
      <div className="flex items-center justify-between px-[10px] py-[6px] sm:mb-2 sm:px-0 sm:py-0">
        <div className="flex items-center gap-4">
          <div
            className="flex h-7 w-7 cursor-pointer items-center justify-center"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft size={16} className="hidden md:block" />
            <ChevronLeft size={16} className="block md:hidden" />
          </div>
          <h1 className="hidden text-xl font-semibold text-[#3F3F46] sm:block">
            {mode === "create" ? "Новий товар" : "Редагувати товар"}
          </h1>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-9 items-center justify-center gap-2 rounded-md px-[6px] py-2 text-sm font-medium text-[#2563EB] focus:border-none focus:outline-none sm:min-w-[121px] sm:bg-[#2563EB] sm:px-4 sm:text-[#F8F9FB] sm:hover:bg-[#3A72ED]"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="hidden h-4 w-4 sm:block" />
          )}
          Зберегти
        </button>
      </div>
      <span className="block px-4 text-lg font-semibold text-[#3F3F46] sm:hidden">
        {mode === "create" ? "Новий товар" : productTitle}
      </span>
    </div>
  )
}
