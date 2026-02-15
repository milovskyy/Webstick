import { FilePen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FaRegEdit } from "react-icons/fa"
import { FiTrash2 } from "react-icons/fi"

type Product = {
  id: string
  title: string
  shortDescription: string | null
  price: number
  imageSmall: string | null
}

type Props = {
  product: Product
  onDelete: () => void
}

export function ProductRow({ product, onDelete }: Props) {
  const router = useRouter()

  return (
    <Link
      key={product.id}
      href={`/products/${product.id}`}
      role="listitem"
      className="flex h-14 w-full items-center justify-between border-b border-[#E4E4E7] hover:bg-[#F4F4F5]"
    >
      <div className="flex items-center gap-2 p-2">
        <div className="relative flex h-10 max-h-10 w-10 max-w-10 items-center justify-center">
          <Image
            src={product.imageSmall ?? "/image-placeholder.png"}
            alt="Product"
            fill
            className="object-contain"
          />
        </div>

        <p className="text-sm font-medium text-[#18181B]">{`${product.title} ${product.shortDescription ? `- ${product.shortDescription}` : ""}`}</p>
      </div>
      <div className="flex">
        <button
          className="flex h-10 w-10 items-center justify-center hover:bg-[#E4E4E7]"
          title="Редагувати"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            router.push(`/products/${product.id}/edit`)
          }}
        >
          <FilePen size={16} color="#09090B" />
        </button>

        <button
          className="flex h-10 w-10 items-center justify-center hover:bg-[#E4E4E7]"
          title="Видалити"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()
          }}
        >
          <FiTrash2 size={16} color="#DC2626" />
        </button>
      </div>
    </Link>
  )
}
