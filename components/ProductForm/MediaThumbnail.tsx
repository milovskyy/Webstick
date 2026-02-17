"use client"

import { FiTrash2 } from "react-icons/fi"
import { MediaPreview } from "./MediaPreview"
import type { CombinedMediaItem } from "../../lib/types"

type MediaThumbnailProps = {
  item: CombinedMediaItem
  onRemove: () => void
  containerClassName?: string
  imageSizes?: string
  imageClassName?: string
  imageObjectFit?: "contain" | "cover"
}

export function MediaThumbnail({
  item,
  onRemove,
  containerClassName,
  imageSizes = "71px",
  imageClassName = "h-full w-full rounded-xl object-cover",
  imageObjectFit = "cover",
}: MediaThumbnailProps) {
  return (
    <div className={containerClassName}>
      <MediaPreview
        url={item.url}
        isVideo={item.isVideo}
        className={imageClassName}
        sizes={imageSizes}
        objectFit={imageObjectFit}
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-#18181B absolute right-[6px] top-[6px] z-20 rounded-sm bg-white p-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  )
}
