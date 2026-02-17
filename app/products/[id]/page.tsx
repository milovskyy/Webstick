import { getProduct } from "@/lib/products"
import { isVideoUrl } from "@/lib/media"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

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
          <ArrowLeft size={16} />
        </Link>

        <h1 className="text-xl font-semibold text-[#3F3F46]">
          {product.title}
        </h1>
        <Link
          href={`/products/${product.id}/edit`}
          className="ml-auto rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#3A72ED]"
        >
          Редагувати
        </Link>
      </div>

      <div className="grid flex-1 gap-10 rounded-2xl border border-[#E4E4E7] bg-white p-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {product.images.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#18181B]">
                Зображення та відео
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {product.images.map((img) => {
                  const src =
                    img.large ?? img.medium ?? img.small ?? img.original
                  if (!src) return null
                  const isVideo = isVideoUrl(src)
                  return (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-xl border border-[#E4E4E7] bg-gray-100"
                    >
                      {isVideo ? (
                        <video
                          src={src}
                          controls
                          playsInline
                          className="h-full w-full object-contain"
                          preload="metadata"
                        />
                      ) : (
                        <Image
                          src={src}
                          alt={product.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl text-sm text-[#A1A1AA]">
              Немає зображень та відео
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {!product.shortDescription && !product.description && (
            <div className="flex h-48 items-center justify-center rounded-xl text-sm text-[#A1A1AA]">
              Немає опису
            </div>
          )}

          {product.shortDescription && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[#A1A1AA]">
                Короткий опис
              </h2>
              <p className="text-sm text-[#18181B]">
                {product.shortDescription}
              </p>
            </div>
          )}
          {product.description && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[#A1A1AA]">Опис</h2>
              <div
                className="prose prose-sm max-w-none text-[#18181B] [&_img]:h-auto [&_img]:max-w-[200px]"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
          <div className="mt-auto border-t border-[#E4E4E7] pt-4">
            <p className="text-2xl font-bold text-[#2563EB]">
              {product.discountPrice && product.discountPrice != 0
                ? `${product.discountPrice.toFixed(2)} ₴`
                : `${product.price.toFixed(2)} ₴`}
            </p>
            {product.discountPrice != 0 && (
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
