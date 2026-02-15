"use client"

import { zodResolver } from "@hookform/resolvers/zod"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { z } from "zod"

import { ArrowLeft, Loader2, Plus, Save, X } from "lucide-react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { FormDescription } from "./FormDescription"
import { Switch } from "./ui/switch"
import { MoneyInput } from "./MoneyInput"
import { Product } from "@prisma/client"
import { isVideoUrl } from "@/lib/media"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { usePreviewSmallSlots } from "@/hooks/usePreviewSmallSlots"
import { FiTrash2 } from "react-icons/fi"

const MAX_TITLE = 200
const MAX_SHORT = 300
const MAX_DESC = 5000
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB per image
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB per video
const ACCEPT_MEDIA = "image/*,video/*"

const schema = z.object({
  title: z.string().min(1).max(MAX_TITLE),
  shortDescription: z.string().max(MAX_SHORT).optional(),
  description: z.string().max(MAX_DESC).optional(),
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0),
  hasDiscount: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

type ProductImage = {
  id: string
  original: string
  small?: string | null
  medium?: string | null
  large?: string | null
}

type ProductFormProps = {
  mode: "create" | "edit"
  product?: Product & { images?: ProductImage[] }
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [removedExistingIds, setRemovedExistingIds] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const prevPreviewsRef = useRef<string[]>([])
  const previewSmallSlots = usePreviewSmallSlots()
  const previewTotalVisible = previewSmallSlots + 1

  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: product?.title ?? "",
      shortDescription: product?.shortDescription ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      discountPrice: product?.discountPrice ?? 0,
      costPrice: product?.costPrice ?? 0,
      hasDiscount: !!product?.discountPrice,
    },
  })

  const price = useWatch({ control: form.control, name: "price" }) ?? 0
  const cost = useWatch({ control: form.control, name: "costPrice" }) ?? 0
  const description =
    useWatch({ control: form.control, name: "description" }) ?? ""
  const shortDescription =
    useWatch({ control: form.control, name: "shortDescription" }) ?? ""
  const title = useWatch({ control: form.control, name: "title" }) ?? ""
  const hasDiscount =
    useWatch({ control: form.control, name: "hasDiscount" }) ?? false

  const { profit, margin } = useMemo(() => {
    const profit = price - cost
    const margin = price > 0 ? Number(((profit / price) * 100).toFixed(2)) : 0
    return { profit, margin }
  }, [price, cost])

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
    return [...existing, ...newItems]
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
    console.log("fileList", fileList)
    const fileArray = Array.from(fileList)
    console.log("fileArray", fileArray)

    const validFiles = fileArray.filter((file) => {
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      if (isImage) return file.size <= MAX_IMAGE_SIZE
      if (isVideo) return file.size <= MAX_VIDEO_SIZE
      return false
    })

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))

    console.log("newPreviews", newPreviews)

    setImages((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  console.log("previews", previews)
  console.log("images", images)

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

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })

    const url =
      mode === "create" ? "/api/products" : `/api/products/${product?.id}`

    images.forEach((file) => {
      formData.append("images", file)
    })

    if (mode === "edit" && removedExistingIds.length > 0) {
      formData.append("removeImageIds", JSON.stringify(removedExistingIds))
    }

    console.log("formData", formData)
    console.log("images", images)

    const method = mode === "create" ? "POST" : "PUT"

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      })
      const text = await res.text()
      if (!res.ok) {
        let errMsg = text
        try {
          const j = JSON.parse(text)
          errMsg = j.error || text
        } catch {
          // use text as is
        }
        setSubmitError(errMsg)
        return
      }
      router.push("/products")
      router.refresh()
    } catch (err) {
      console.error(err)
      setSubmitError(err instanceof Error ? err.message : "Помилка мережі")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatNumber = (value: number | string) => {
    if (value === "" || value === null || value === undefined) return ""
    const number = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(number)) return ""
    return number.toLocaleString("uk-UA")
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex h-full w-[1090px] flex-col gap-4"
    >
      {submitError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {submitError && <p>{submitError}</p>}
        </div>
      )}
      <div className="mb-2 flex items-center justify-between px-4 py-2 sm:px-0 sm:py-0">
        <div className="flex items-center gap-4">
          <div
            className="flex h-7 w-7 cursor-pointer items-center justify-center"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft size={16} />
          </div>
          <h1 className="text-xl font-semibold text-[#3F3F46]">
            {mode === "create" ? "Новий товар" : "Редагувати товар"}
          </h1>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-9 min-w-[121px] items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-[#F8F9FB] hover:bg-[#3A72ED] focus:border-none focus:outline-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Зберегти
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-4">
        {/* Назва */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label
              className={cn(
                "text-sm font-medium",
                form.formState.errors.title
                  ? "text-[#DC2626]"
                  : "text-[#18181B]"
              )}
            >
              Назва <span className="text-[#DC2626]">*</span>
            </label>
            <span className="text-sm text-[#A1A1AA]">
              {title.length}/{MAX_TITLE}
            </span>
          </div>

          <Controller
            control={form.control}
            name="title"
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                maxLength={MAX_TITLE}
                placeholder="Назва товару"
                className="w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#18181B] placeholder:text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0"
              />
            )}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-[#DC2626]">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Короткий опис */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-[#18181B]">
              Короткий опис
            </label>
            <span className="text-sm text-[#A1A1AA]">
              {shortDescription.length}/{MAX_SHORT}
            </span>
          </div>

          <Controller
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <Textarea
                {...field}
                maxLength={MAX_SHORT}
                className="h-[98px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#18181B] scrollbar-blue placeholder:text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0"
              />
            )}
          />
        </div>

        {/* Опис */}

        <FormDescription
          value={description}
          onChange={(value) => form.setValue("description", value)}
        />
      </div>

      {/* Зображення */}

      <div
        className={cn(
          "h-[208px] rounded-2xl border border-[#E4E4E7] bg-white p-4",
          combinedList.length > 0 && "h-full"
        )}
      >
        <h2 className="mb-6 text-lg font-semibold text-[#18181B]">
          Зображення
        </h2>

        {/* PREVIEW: 1 большая + одна сетка (миниатюры + overflow + кнопка), макс 2 ряда; размеры по брейкпоинтам */}
        {combinedList.length > 0 ? (
          <div className="flex gap-2 sm:flex sm:gap-2">
            {/* Большое превью */}
            <div className="group relative h-[153px] w-[153px] shrink-0 self-start rounded-xl border border-[#E4E4E7] sm:h-[180px] sm:w-[180px] md:h-[209px] md:w-[209px]">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-black/0 transition group-hover:bg-black/50" />
              {combinedList[0].isVideo ? (
                <video
                  src={combinedList[0].url}
                  className="h-full w-full rounded-xl object-contain"
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={combinedList[0].url}
                  alt="Preview"
                  fill
                  className="rounded-xl object-cover"
                  unoptimized={combinedList[0].url.startsWith("blob:")}
                />
              )}
              {(() => {
                const first = combinedList[0]
                if (first.isNew && "newIndex" in first) {
                  return (
                    <button
                      type="button"
                      onClick={() => removeNewImage(first.newIndex)}
                      className="text-#18181B absolute right-[6px] top-[6px] z-20 rounded-sm bg-white p-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )
                }
                if (!first.isNew && "id" in first) {
                  return (
                    <button
                      type="button"
                      onClick={() => removeExistingImage(first.id)}
                      className="text-#18181B absolute right-[6px] top-[6px] z-20 rounded-sm bg-white p-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )
                }
                return null
              })()}
            </div>

            {/* Одна сетка: миниатюры + overflow (если есть) + кнопка; 4+ колонок = макс 2 ряда */}
            <div className="flex flex-1 flex-col gap-2">
              {(() => {
                const totalCount = combinedList.length
                const hasOverflow = totalCount > previewTotalVisible
                const overflowCount = hasOverflow
                  ? totalCount - previewTotalVisible + 1
                  : 0
                const normalSmallCount =
                  totalCount <= 1
                    ? 0
                    : hasOverflow
                      ? previewSmallSlots - 1
                      : Math.min(previewSmallSlots, totalCount - 1)
                const smallItems = combinedList.slice(1, 1 + normalSmallCount)

                return (
                  <div
                    className={cn(
                      "grid gap-2",
                      "grid-cols-[repeat(2,71px)] sm:grid-cols-[repeat(4,80px)] md:grid-cols-[repeat(5,90px)] lg:grid-cols-[repeat(6,100px)] xl:grid-cols-[repeat(7,100px)]"
                    )}
                  >
                    {smallItems.map((item) => (
                      <div
                        key={item.key}
                        className="group relative aspect-square w-[71px] shrink-0 overflow-hidden rounded-xl border border-[#E4E4E7] sm:w-[80px] sm:min-w-[80px] md:w-[90px] md:min-w-[90px] lg:w-[100px] lg:min-w-[100px]"
                      >
                        <div className="pointer-events-none absolute inset-0 z-10 bg-black/0 transition group-hover:bg-black/50" />
                        {item.isVideo ? (
                          <video
                            src={item.url}
                            className="h-full w-full rounded-xl object-cover"
                            controls
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <Image
                            src={item.url}
                            alt="Preview"
                            fill
                            className="rounded-xl object-cover"
                            unoptimized={item.url.startsWith("blob:")}
                          />
                        )}
                        {item.isNew && "newIndex" in item ? (
                          <button
                            type="button"
                            onClick={() => removeNewImage(item.newIndex)}
                            className="text-#18181B absolute right-[6px] top-[6px] z-20 rounded-sm bg-white p-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        ) : !item.isNew && "id" in item ? (
                          <button
                            type="button"
                            onClick={() => removeExistingImage(item.id)}
                            className="text-#18181B absolute right-[6px] top-[6px] z-20 rounded-sm bg-white p-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {hasOverflow && (
                      <div
                        className="relative aspect-square w-[71px] shrink-0 overflow-hidden rounded-xl border border-[#E4E4E7] sm:w-[80px] md:w-[90px] lg:w-[100px]"
                        title={`Ще ${overflowCount} фото`}
                      >
                        {combinedList[combinedList.length - 1].isVideo ? (
                          <video
                            src={combinedList[combinedList.length - 1].url}
                            className="h-full w-full rounded-xl object-cover brightness-50"
                            controls
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <Image
                            src={combinedList[combinedList.length - 1].url}
                            alt="Preview"
                            fill
                            className="rounded-xl object-cover brightness-50"
                            unoptimized={combinedList[
                              combinedList.length - 1
                            ].url.startsWith("blob:")}
                          />
                        )}
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
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDragging(false)
                        handleFiles(e.dataTransfer.files)
                      }}
                    >
                      <label
                        htmlFor="images"
                        className="flex h-full w-full cursor-pointer items-center justify-center"
                      >
                        <Plus size={28} className="text-[#3F3F46] sm:size-8" />
                      </label>
                      <input
                        type="file"
                        multiple
                        accept={ACCEPT_MEDIA}
                        className="hidden"
                        id="images"
                        onChange={(e) =>
                          e.target.files && handleFiles(e.target.files)
                        }
                      />
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFiles(e.dataTransfer.files)
            }}
            className={cn(
              "box-border flex h-[124px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-[#F8F9FB] p-8 text-center hover:border-none hover:bg-[#E2E2E2]",
              isDragging && "bg-[#E2E2E2]"
            )}
          >
            <input
              type="file"
              multiple
              accept={ACCEPT_MEDIA}
              className="hidden"
              id="images"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            <label
              htmlFor="images"
              className="box-border cursor-pointer rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-xs font-medium text-[#18181B] hover:bg-[#F8F9FB]"
            >
              Завантажити
            </label>

            <p className="px-3 text-sm text-[#3F3F46] sm:px-0">
              Ви можете завантажити зображення до 10 Mb, відео до 100 Mb або
              медіа файли за посиланням
            </p>
          </div>
        )}
      </div>

      {/* Ціни */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-4">
        <h2 className="text-lg font-semibold text-[#18181B]">Ціни</h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#18181B]">Ціна</label>
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]">
              ₴
            </span>

            <MoneyInput name="price" control={form.control} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="hasDiscount"
            render={({ field: { value, onChange, ...rest } }) => (
              <Switch
                checked={!!value}
                onCheckedChange={(checked: boolean) => onChange(checked)}
                id="hasDiscount"
                className="data-[state=checked]:bg-[#2563EB]"
                {...rest}
              />
            )}
          />

          <label className="text-sm font-medium text-[#18181B]">Знижка</label>
        </div>

        {hasDiscount && (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#18181B]">Ціна зі знижкою</label>
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]">
                ₴
              </span>

              <MoneyInput name="discountPrice" control={form.control} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#18181B]">
              Собівартість
            </label>
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]">
                ₴
              </span>

              <MoneyInput name="costPrice" control={form.control} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#18181B]">
              Прибуток
            </label>
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#A1A1AA]">
                ₴
              </span>

              <Input
                id="profit"
                type="text"
                disabled
                placeholder="0"
                className="w-full rounded-md border border-[#E4E4E7] bg-white py-2 pl-6 pr-3 text-sm placeholder:text-[#A1A1AA] disabled:text-[#A1A1AA]"
                value={formatNumber(profit)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#18181B]">Маржа</label>
            <Input
              id="margin"
              type="text"
              disabled
              placeholder="0%"
              className="w-full rounded-md border border-[#E4E4E7] bg-white py-2 pl-3 pr-3 text-sm placeholder:text-[#A1A1AA] disabled:text-[#A1A1AA]"
              value={`${margin}%`}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
