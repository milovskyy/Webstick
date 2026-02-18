"use client"

import Image from "next/image"

type MediaPreviewProps = {
  url: string
  isVideo: boolean
  className?: string
  sizes?: string
  objectFit?: "contain" | "cover"
  brightness?: string
}

export function MediaPreview({
  url,
  isVideo,
  className = "h-full w-full rounded-xl object-cover",
  sizes = "71px",
  objectFit = "cover",
  brightness,
}: MediaPreviewProps) {
  const fitClass =
    objectFit === "contain" ? "object-contain" : "object-cover"
  const finalClassName = [className, fitClass, brightness].filter(Boolean).join(" ")

  if (isVideo) {
    return (
      <video
        src={url}
        className={finalClassName}
        controls
        playsInline
        preload="metadata"
      />
    )
  }

  return (
    <Image
      src={url}
      alt="Preview"
      fill
      sizes={sizes}
      className={finalClassName}
      unoptimized={url.startsWith("blob:") || url.startsWith("/uploads/")}
    />
  )
}
