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
import { cn } from "@/lib/utils"
import Image from "next/image"

const MAX_TITLE = 200
const MAX_SHORT = 300
const MAX_DESC = 5000

const PREVIEW_SMALL_SLOTS_MAX = 7
const PREVIEW_SMALL_SLOTS_MIN = 3

/** Число маленьких слотов по брейкпоинту: 3 (мобильный) → 7 (xl), в духе Tailwind. Берём самый большой сработавший брейкпоинт. */
function usePreviewSmallSlots(): number {
  const [slots, setSlots] = useState(PREVIEW_SMALL_SLOTS_MIN)

  useEffect(() => {
    const media = [
      { q: "(min-width: 1280px)", v: 7 },
      { q: "(min-width: 1024px)", v: 6 },
      { q: "(min-width: 768px)", v: 5 },
      { q: "(min-width: 640px)", v: 4 },
    ] as const
    const mql = media.map(({ q }) => window.matchMedia(q))

    const update = () => {
      let v = PREVIEW_SMALL_SLOTS_MIN
      for (let i = 0; i < mql.length; i++) {
        if (mql[i].matches) {
          v = media[i].v
          break
        }
      }
      setSlots(v)
    }

    update()
    mql.forEach((m) => m.addEventListener("change", update))
    return () => mql.forEach((m) => m.removeEventListener("change", update))
  }, [])

  return slots
}

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

type ProductFormProps = {
  mode: "create" | "edit"
  product?: Product
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const prevPreviewsRef = useRef<string[]>([])
  const previewSmallSlots = usePreviewSmallSlots()
  const previewTotalVisible = previewSmallSlots + 1

  const router = useRouter()

  // console.log("product", product)

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

    const validFiles = fileArray.filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024
    )

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const urlToRevoke = previews[index]
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    // Revoke after React has committed update, so Image is no longer using this URL
    if (urlToRevoke) {
      queueMicrotask(() => URL.revokeObjectURL(urlToRevoke))
    }
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

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

    console.log("formData", formData)
    console.log("images", images)

    const method = mode === "create" ? "POST" : "PUT"

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      })
      if (!res.ok) {
        console.error(await res.text())
      }

      router.push("/products")
    } catch (err) {
      console.error(err)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-7 w-7 cursor-pointer items-center justify-center"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft size={16} />
          </div>
          <h1 className="text-xl font-semibold text-[#3F3F46]">Новий товар</h1>
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
            <label className="text-sm text-[#18181B]">
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
                className="w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#18181B] placeholder:text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0"
              />
            )}
          />
        </div>

        {/* Короткий опис */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-sm text-[#18181B]">Короткий опис</label>
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
      {/* <div className="h-[208px] rounded-2xl border border-[#E4E4E7] bg-white p-4">
        <h2 className="mb-6 text-lg font-semibold text-[#18181B]">
          Зображення
        </h2>


        <div className="box-border flex h-[124px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-[#F8F9FB] p-8 text-center hover:border-none hover:bg-[#E2E2E2]">
          <input
            type="file"
            className="hidden"
            id="image"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setPreview(URL.createObjectURL(file))
              }
            }}
          />
          <label
            htmlFor="image"
            className="box-border cursor-pointer rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-xs font-medium text-[#18181B] hover:bg-[#F8F9FB]"
          >
            Завантажити
          </label>

          <p className="mt-4 text-sm text-[#3F3F46]">
            Ви можете завантажити зображення до 10 Mb, відео до 100 Mb або медіа
            файли за посиланням
          </p>
        </div>

        {preview && <img src={preview} className="mt-4 h-32 rounded-md" />}
      </div> */}
      <div
        className={cn(
          "h-[208px] rounded-2xl border border-[#E4E4E7] bg-white p-4",
          previews.length > 0 && "h-full"
        )}
      >
        <h2 className="mb-6 text-lg font-semibold text-[#18181B]">
          Зображення
        </h2>

        {/* PREVIEW: 1 большая + одна сетка (миниатюры + overflow + кнопка), макс 2 ряда; размеры по брейкпоинтам */}
        {previews.length > 0 ? (
          <div className="flex gap-2 sm:flex sm:gap-2">
            {/* Большое превью: 153 мобильный, 209 с md */}
            <div className="group relative h-[153px] w-[153px] shrink-0 self-start rounded-xl border border-[#E4E4E7] sm:h-[180px] sm:w-[180px] md:h-[209px] md:w-[209px]">
              <Image
                src={previews[0]}
                alt="Preview"
                fill
                className="rounded-xl object-contain"
              />
              <button
                type="button"
                onClick={() => removeImage(0)}
                className="absolute right-1 top-1 rounded-full bg-[#2563EB] p-1 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>

            {/* Одна сетка: миниатюры + overflow (если есть) + кнопка; 4+ колонок = макс 2 ряда */}
            <div className="flex flex-1 flex-col gap-2">
              {(() => {
                const hasOverflow = previews.length > previewTotalVisible
                const overflowCount = hasOverflow
                  ? previews.length - previewTotalVisible + 1
                  : 0
                const normalSmallCount =
                  previews.length <= 1
                    ? 0
                    : hasOverflow
                      ? previewSmallSlots - 1
                      : Math.min(previewSmallSlots, previews.length - 1)
                const smallPreviews = previews.slice(1, 1 + normalSmallCount)

                return (
                  <div
                    className={cn(
                      "grid gap-2",
                      "grid-cols-[repeat(2,71px)] sm:grid-cols-[repeat(4,80px)] md:grid-cols-[repeat(5,90px)] lg:grid-cols-[repeat(6,100px)] xl:grid-cols-[repeat(7,100px)]"
                    )}
                  >
                    {smallPreviews.map((src, index) => {
                      const actualIndex = index + 1
                      return (
                        <div
                          key={actualIndex}
                          className="group relative aspect-square w-[71px] shrink-0 rounded-xl border border-[#E4E4E7] sm:w-[80px] sm:min-w-[80px] md:w-[90px] md:min-w-[90px] lg:w-[100px] lg:min-w-[100px]"
                        >
                          <Image
                            src={src}
                            alt="Preview"
                            fill
                            className="rounded-xl object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(actualIndex)}
                            className="absolute right-1 top-1 rounded-full bg-[#2563EB] p-[2px] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )
                    })}
                    {hasOverflow && (
                      <div
                        className="relative aspect-square w-[71px] shrink-0 overflow-hidden rounded-xl border border-[#E4E4E7] sm:w-[80px] md:w-[90px] lg:w-[100px]"
                        title={`Ще ${overflowCount} фото`}
                      >
                        <Image
                          src={previews[previews.length - 1]}
                          alt="Preview"
                          fill
                          className="rounded-xl object-cover brightness-50"
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
                        accept="image/*"
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
              accept="image/*"
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

            <p className="text-sm text-[#3F3F46]">
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
          <label className="text-sm text-[#18181B]">Ціна</label>
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
            <label className="text-sm text-[#18181B]">Собівартість</label>
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]">
                ₴
              </span>

              <MoneyInput name="costPrice" control={form.control} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#18181B]">Прибуток</label>
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
            <label className="text-sm text-[#18181B]">Маржа</label>
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
