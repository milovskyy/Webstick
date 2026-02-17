"use client"

import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCEPT_MEDIA } from "@/lib/constants"
import { MediaPreview } from "./MediaPreview"
import { MediaThumbnail } from "./MediaThumbnail"
import type { CombinedMediaItem } from "../../lib/types"

type ProductFormImageUploadProps = {
  combinedList: CombinedMediaItem[]
  previewTotalVisible: number
  previewSmallSlots: number
  isDragging: boolean
  setIsDragging: (v: boolean) => void
  handleFiles: (files: FileList) => void
  removeNewImage: (index: number) => void
  removeExistingImage: (id: string) => void
}

export function ProductFormImageUpload({
  combinedList,
  previewTotalVisible,
  previewSmallSlots,
  isDragging,
  setIsDragging,
  handleFiles,
  removeNewImage,
  removeExistingImage,
}: ProductFormImageUploadProps) {
  const totalCount = combinedList.length
  const hasOverflow = totalCount > previewTotalVisible
  const overflowCount = hasOverflow ? totalCount - previewTotalVisible + 1 : 0
  const normalSmallCount =
    totalCount <= 1
      ? 0
      : hasOverflow
        ? previewSmallSlots - 1
        : Math.min(previewSmallSlots, totalCount - 1)
  const smallItems = combinedList.slice(1, 1 + normalSmallCount)

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
  }

  const fileInput = (
    <input
      type="file"
      multiple
      accept={ACCEPT_MEDIA}
      className="hidden"
      id="images"
      onChange={(e) => e.target.files && handleFiles(e.target.files)}
    />
  )

  if (combinedList.length === 0) {
    return (
      <div
        {...dragHandlers}
        className={cn(
          "box-border flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-[#F8F9FB] p-8 text-center hover:border-none hover:bg-[#E2E2E2] sm:h-[124px]",
          isDragging && "bg-[#E2E2E2]"
        )}
      >
        {fileInput}
        <label
          htmlFor="images"
          className="box-border cursor-pointer rounded-md border border-[#E4E4E7] bg-white px-3 py-[6px] text-xs font-medium text-[#18181B] hover:bg-[#F8F9FB] sm:py-2"
        >
          Завантажити
        </label>
        <p className="px-3 text-sm text-[#3F3F46] sm:px-0">
          Ви можете завантажити зображення до 10 Mb, відео до 100 Mb або медіа
          файли за посиланням
        </p>
      </div>
    )
  }

  const firstItem = combinedList[0]

  return (
    <div className="flex gap-2 sm:flex sm:gap-2">
   
      <div className="group relative h-[153px] w-[153px] shrink-0 self-start rounded-xl border border-[#E4E4E7] sm:h-[180px] sm:w-[180px] md:h-[209px] md:w-[209px]">
        <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-black/0 transition group-hover:bg-black/50" />
        <MediaThumbnail
          item={firstItem}
          onRemove={() =>
            firstItem.isNew
              ? removeNewImage(firstItem.newIndex)
              : removeExistingImage(firstItem.id)
          }
          containerClassName="relative h-full w-full"
          imageSizes="153px"
          imageClassName="rounded-xl object-cover"
          imageObjectFit="contain"
        />
      </div>

    
      <div className="flex flex-1 flex-col gap-2">
        <div className="grid grid-cols-[repeat(2,71px)] gap-2 sm:grid-cols-[repeat(4,80px)] md:grid-cols-[repeat(5,90px)] lg:grid-cols-[repeat(6,100px)] xl:grid-cols-[repeat(7,100px)]">
          {smallItems.map((item) => (
            <div
              key={item.key}
              className="group relative aspect-square w-[71px] shrink-0 overflow-hidden rounded-xl border border-[#E4E4E7] sm:w-[80px] sm:min-w-[80px] md:w-[90px] md:min-w-[90px] lg:w-[100px] lg:min-w-[100px]"
            >
              <div className="pointer-events-none absolute inset-0 z-10 bg-black/0 transition group-hover:bg-black/50" />
              <MediaThumbnail
                item={item}
                onRemove={() =>
                  item.isNew
                    ? removeNewImage(item.newIndex)
                    : removeExistingImage(item.id)
                }
                containerClassName="relative h-full w-full"
              />
            </div>
          ))}
          {hasOverflow && (
            <div
              className="relative aspect-square w-[71px] shrink-0 overflow-hidden rounded-xl border border-[#E4E4E7] sm:w-[80px] md:w-[90px] lg:w-[100px]"
              title={`Ще ${overflowCount} фото`}
            >
              <MediaPreview
                url={combinedList[combinedList.length - 1].url}
                isVideo={combinedList[combinedList.length - 1].isVideo}
                className="h-full w-full rounded-xl object-cover brightness-50"
                sizes="71px"
              />
              <span className="absolute inset-0 flex items-center justify-center text-base font-semibold text-white drop-shadow-md sm:text-lg">
                +{overflowCount}
              </span>
            </div>
          )}
          <div
            className={cn(
              "flex aspect-square w-[71px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#E4E4E7] bg-[#F8F9FB] hover:bg-[#E2E2E2] sm:w-[80px] md:w-[90px] lg:w-[100px]",
              isDragging && "bg-[#E2E2E2]"
            )}
            {...dragHandlers}
          >
            <label
              htmlFor="images"
              className="flex h-full w-full cursor-pointer items-center justify-center"
            >
              <Plus size={28} className="text-[#3F3F46] sm:size-8" />
            </label>
            {fileInput}
          </div>
        </div>
      </div>
    </div>
  )
}
