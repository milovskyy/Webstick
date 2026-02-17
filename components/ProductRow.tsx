import Image from "next/image"
import Link from "next/link"
import { FilePen } from "lucide-react"
import { FiTrash2 } from "react-icons/fi"
import { getFirstPhotoUrl } from "@/lib/products"
import type { ProductWithImages } from "@/lib/types"

type Props = {
  product: ProductWithImages
  onDelete: () => void
}

const ROW_ACTION_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center hover:bg-[#E4E4E7]"

export function ProductRow({ product, onDelete }: Props) {
  return (
    <div
      role="listitem"
      className="flex h-14 w-full items-center justify-between border-b border-[#E4E4E7] bg-white hover:bg-[#F4F4F5]"
    >
      <Link
        href={`/products/${product.id}`}
        className="flex min-w-0 flex-1 items-center gap-2 p-2"
      >
        <div className="relative flex h-10 max-h-10 w-10 max-w-10 flex-shrink-0 items-center justify-center">
          <Image
            src={getFirstPhotoUrl(product.images) ?? "/image-placeholder.png"}
            alt="Product"
            fill
            sizes="40px"
            className="h-10 w-10 object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 text-sm font-medium text-[#18181B]">
          <span>{product.title}</span>
          {product.shortDescription && (
            <span className="hidden sm:block">
              &nbsp;- {product.shortDescription}
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-shrink-0 gap-2">
        <Link
          href={`/products/${product.id}/edit`}
          className={ROW_ACTION_BUTTON_CLASS}
          title="Редагувати"
          aria-label="Редагувати"
        >
          <FilePen size={16} color="#09090B" />
        </Link>
        <button
          type="button"
          className={ROW_ACTION_BUTTON_CLASS}
          title="Видалити"
          aria-label="Видалити"
          onClick={onDelete}
        >
          <FiTrash2 size={16} color="#DC2626" />
        </button>
      </div>
    </div>
  )
}
