"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { schema, type FormValues } from "@/lib/schema"
import type { ProductFormProps } from "@/lib/types"
import { useProductFormMedia } from "@/hooks/useProductFormMedia"
import { ProductFormHeader } from "./ProductFormHeader"
import { ProductFormBasicFields } from "./ProductFormBasicFields"
import { ProductFormImageUpload } from "./ProductFormImageUpload"
import { ProductFormPrices } from "./ProductFormPrices"
import { cn } from "@/lib/utils"

export function ProductForm({ mode, product }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
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
    const p = price - cost
    const m = price > 0 ? Number(((p / price) * 100).toFixed(2)) : 0
    return { profit: p, margin: m }
  }, [price, cost])

  const media = useProductFormMedia({ product })

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
    const method = mode === "create" ? "POST" : "PUT"

    media.images.forEach((file) => formData.append("images", file))
    if (mode === "edit" && media.removedExistingIds.length > 0) {
      formData.append(
        "removeImageIds",
        JSON.stringify(media.removedExistingIds)
      )
    }

    try {
      const res = await fetch(url, { method, body: formData })
      const text = await res.text()
      if (!res.ok) {
        let errMsg = text
        try {
          const j = JSON.parse(text)
          errMsg = j.error || text
        } catch {
          console.error("Error parsing JSON:", text)
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
          <p>{submitError}</p>
        </div>
      )}

      <ProductFormHeader
        mode={mode}
        isSubmitting={isSubmitting}
        productTitle={product?.title}
      />

      <ProductFormBasicFields
        control={form.control}
        errors={form.formState.errors}
        title={title}
        shortDescription={shortDescription}
        description={description}
        onDescriptionChange={(value) => form.setValue("description", value)}
      />

      <div
        className={cn(
          "bg-white p-4 sm:h-[208px] sm:rounded-2xl sm:border sm:border-[#E4E4E7]",
          media.combinedList.length > 0 && "h-full sm:h-full"
        )}
      >
        <h2 className="mb-6 text-lg font-semibold text-[#18181B]">
          Зображення
        </h2>
        <ProductFormImageUpload
          combinedList={media.combinedList}
          previewTotalVisible={media.previewTotalVisible}
          previewSmallSlots={media.previewSmallSlots}
          isDragging={media.isDragging}
          setIsDragging={media.setIsDragging}
          handleFiles={media.handleFiles}
          removeNewImage={media.removeNewImage}
          removeExistingImage={media.removeExistingImage}
        />
      </div>

      <ProductFormPrices
        control={form.control}
        errors={form.formState.errors}
        hasDiscount={hasDiscount}
        profit={profit}
        margin={margin}
        formatNumber={formatNumber}
      />
    </form>
  )
}
