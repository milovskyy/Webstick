"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiArrowLeft } from "react-icons/fi"
import { LuSave } from "react-icons/lu"
import { ClipLoader } from "react-spinners"
import { z } from "zod"

const productSchema = z.object({
  title: z.string().min(1, "Назва обов'язкова"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Ціна повинна бути додатньою"),
  // image: z.instanceof(FileList).optional(),
  image: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

type ProductFormProps = {
  initialData?: {
    id: string
    title: string
    shortDescription?: string | null
    description?: string | null
    price: number
    imageSmall?: string | null
  }
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          shortDescription: initialData.shortDescription || "",
          description: initialData.description || "",
          price: initialData.price,
        }
      : undefined,
  })

  const onSubmit = async (data: ProductFormData) => {
    console.log("data", data)
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("shortDescription", data.shortDescription || "")
      formData.append("description", data.description || "")
      formData.append("price", data.price.toString())

      // if (data.image && data.image.length > 0) {
      //   formData.append("image", data.image[0])
      // }

      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products"

      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Помилка збереження товару")
      }

      router.push("/products")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невідома помилка")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-[1090px] flex-col gap-4"
    >
      {error && (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      <div className="flex h-9 justify-between bg-blue-100">
        <div className="flex items-center gap-4">
          <div className="flex h-7 w-7 items-center justify-center">
            <FiArrowLeft size={16} />
          </div>
          <h1 className="text-xl font-semibold text-[#3F3F46]">Новий товар</h1>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          // onClick={handleConfirm}
          className="flex h-9 min-w-[121px] items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-[#F8F9FB] hover:bg-[#3A72ED] focus:border-none focus:outline-none"
        >
          <>
            {isSubmitting ? (
              <ClipLoader color="#FEF2F2" size={16} />
            ) : (
              <LuSave size={16} color="#F8F9FB" />
            )}
            <p>Зберегти</p>
          </>
        </button>
      </div>

      <div className="rounded-2xl border border-[#E4E4E7] bg-white p-4">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Назва товару *
          </label>
          <input
            {...register("title")}
            type="text"
            id="title"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="shortDescription"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Короткий опис
          </label>
          <input
            {...register("shortDescription")}
            type="text"
            id="shortDescription"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Опис
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="rounded-2xl border border-[#E4E4E7] bg-white p-4">
        {" "}
        <div>
          <label
            htmlFor="image"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Зображення
          </label>
          {initialData?.imageSmall && (
            <div className="mb-2">
              <p className="mb-1 text-sm text-gray-600">Поточне зображення:</p>
              <img
                src={initialData.imageSmall}
                alt={initialData.title}
                className="h-32 w-32 rounded object-cover"
              />
            </div>
          )}
          <input
            {...register("image")}
            type="file"
            id="image"
            accept="image/*"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!initialData && (
            <p className="mt-1 text-sm text-gray-500">
              Залиште порожнім, щоб не завантажувати зображення
            </p>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-[#E4E4E7] bg-white p-4">
        {" "}
        <div>
          <label
            htmlFor="price"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Ціна *
          </label>
          <input
            {...register("price", { valueAsNumber: true })}
            type="number"
            step="0.01"
            id="price"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>
      </div>
    </form>
  )
}
