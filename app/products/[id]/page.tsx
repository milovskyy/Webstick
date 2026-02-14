import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="flex h-full flex-col bg-[#F8F9FB] p-5 pb-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/products"
          className="flex h-7 w-7 items-center justify-center text-[#3F3F46] hover:text-[#2563EB]"
        >
          ←
        </Link>
        <h1 className="text-xl font-semibold text-[#3F3F46]">{product.title}</h1>
        <Link
          href={`/products/${product.id}/edit`}
          className="ml-auto rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#3A72ED]"
        >
          Редагувати
        </Link>
      </div>

      <div className="grid flex-1 gap-6 rounded-2xl border border-[#E4E4E7] bg-white p-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {product.images.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#18181B]">Зображення</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {product.images.map((img) => {
                  const src = img.small ?? img.medium ?? img.large ?? img.original
                  if (!src) return null
                  return (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-xl border border-[#E4E4E7] bg-gray-100"
                    >
                      <Image
                        src={src}
                        alt={product.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#E4E4E7] bg-[#F8F9FB] text-sm text-[#A1A1AA]">
              Немає зображень
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {product.shortDescription && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[#A1A1AA]">Короткий опис</h2>
              <p className="text-sm text-[#18181B]">{product.shortDescription}</p>
            </div>
          )}
          {product.description && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[#A1A1AA]">Опис</h2>
              <div
                className="prose prose-sm max-w-none text-[#18181B]"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
          <div className="mt-auto border-t border-[#E4E4E7] pt-4">
            <p className="text-2xl font-bold text-[#2563EB]">
              {product.discountPrice != null
                ? `${product.discountPrice.toFixed(2)} ₴`
                : `${product.price.toFixed(2)} ₴`}
            </p>
            {product.discountPrice != null && (
              <p className="text-sm text-[#A1A1AA] line-through">
                {product.price.toFixed(2)} ₴
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
