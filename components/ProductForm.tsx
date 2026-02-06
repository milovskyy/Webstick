'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const productSchema = z.object({
  title: z.string().min(1, 'Назва обов\'язкова'),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Ціна повинна бути додатньою'),
  image: z.instanceof(FileList).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
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
          shortDescription: initialData.shortDescription || '',
          description: initialData.description || '',
          price: initialData.price,
        }
      : undefined,
  })

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('shortDescription', data.shortDescription || '')
      formData.append('description', data.description || '')
      formData.append('price', data.price.toString())

      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0])
      }

      const url = initialData
        ? `/api/products/${initialData.id}`
        : '/api/products'

      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Помилка збереження товару')
      }

      router.push('/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Назва товару *
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Короткий опис
        </label>
        <input
          {...register('shortDescription')}
          type="text"
          id="shortDescription"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Опис
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Ціна *
        </label>
        <input
          {...register('price', { valueAsNumber: true })}
          type="number"
          step="0.01"
          id="price"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Зображення
        </label>
        {initialData?.imageSmall && (
          <div className="mb-2">
            <p className="text-sm text-gray-600 mb-1">Поточне зображення:</p>
            <img
              src={initialData.imageSmall}
              alt={initialData.title}
              className="w-32 h-32 object-cover rounded"
            />
          </div>
        )}
        <input
          {...register('image')}
          type="file"
          id="image"
          accept="image/*"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {!initialData && (
          <p className="mt-1 text-sm text-gray-500">Залиште порожнім, щоб не завантажувати зображення</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Збереження...' : initialData ? 'Оновити' : 'Створити'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Скасувати
        </button>
      </div>
    </form>
  )
}
