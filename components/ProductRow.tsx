import Image from "next/image"
import { FaRegEdit } from "react-icons/fa"
import { FiTrash2 } from "react-icons/fi"

type Props = {
  onDelete: () => void
}

export function ProductRow({ onDelete }: Props) {
  return (
    <div className="flex h-14 w-full items-center justify-between border-b border-[#E4E4E7] hover:bg-[#F4F4F5]">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center bg-gray-200">
          <Image
            src="/productrow-image-test.png"
            alt="Product"
            width={40}
            height={40}
          />
        </div>

        <p className="text-sm font-medium text-[#18181B]">Product Name</p>
      </div>
      <div className="flex gap-1">
        <button
          className="flex h-9 w-9 items-center justify-center"
          title="Редагувати"
        >
          <FaRegEdit size={16} color="#09090B" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center"
          title="Видалити"
          onClick={onDelete}
        >
          <FiTrash2 size={16} color="#DC2626" />
        </button>
      </div>
    </div>
  )
}
