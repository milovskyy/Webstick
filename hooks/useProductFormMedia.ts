"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { isVideoUrl } from "@/lib/media"
import { usePreviewSmallSlots } from "@/hooks/usePreviewSmallSlots"
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "@/lib/constants"
import type { CombinedMediaItem, ProductWithImages } from "../lib/types"

type Props = {
  product?: ProductWithImages | null
}

export function useProductFormMedia({ product }: Props) {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [removedExistingIds, setRemovedExistingIds] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const prevPreviewsRef = useRef<string[]>([])
  const previewSmallSlots = usePreviewSmallSlots()
  const previewTotalVisible = previewSmallSlots + 1

  const existingMedia = useMemo(() => {
    if (!product?.images?.length) return []
    return product.images.map((img) => {
      const url = img.small ?? img.medium ?? img.large ?? img.original
      return { id: img.id, url, isVideo: isVideoUrl(img.original) }
    })
  }, [product?.id, product?.images])

  const combinedList = useMemo(() => {
    const existing = existingMedia
      .filter((e) => !removedExistingIds.includes(e.id))
      .map((e) => ({
        key: e.id,
        id: e.id,
        url: e.url,
        isVideo: e.isVideo,
        isNew: false as const,
      }))
    const newItems = previews.map((url, i) => ({
      key: `new-${i}`,
      url,
      isVideo: images[i]?.type.startsWith("video/") ?? false,
      isNew: true as const,
      newIndex: i,
    }))
    return [...existing, ...newItems] as CombinedMediaItem[]
  }, [existingMedia, removedExistingIds, previews, images])

  useEffect(() => {
    const prev = prevPreviewsRef.current
    prevPreviewsRef.current = previews
    return () => {
      prev.filter((url) => !previews.includes(url)).forEach(URL.revokeObjectURL)
    }
  }, [previews])

  useEffect(() => {
    return () => {
      prevPreviewsRef.current.forEach(URL.revokeObjectURL)
    }
  }, [])

  const handleFiles = (fileList: FileList) => {
    const fileArray = Array.from(fileList)

    const validFiles = fileArray.filter((file) => {
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      if (isImage) return file.size <= MAX_IMAGE_SIZE
      if (isVideo) return file.size <= MAX_VIDEO_SIZE
      return false
    })

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const urlToRevoke = previews[index]
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    if (urlToRevoke) {
      queueMicrotask(() => URL.revokeObjectURL(urlToRevoke))
    }
  }

  const removeNewImage = (newIndex: number) => {
    removeImage(newIndex)
  }

  const removeExistingImage = (existingId: string) => {
    setRemovedExistingIds((prev) => [...prev, existingId])
  }

  return {
    images,
    setImages,
    removedExistingIds,
    combinedList,
    previewTotalVisible,
    previewSmallSlots,
    handleFiles,
    removeImage,
    removeNewImage,
    removeExistingImage,
    isDragging,
    setIsDragging,
  }
}
