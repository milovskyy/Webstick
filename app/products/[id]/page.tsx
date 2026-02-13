import { ProductForm } from "@/components/ProductForm"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"

async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
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
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Редагувати товар</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="max-w-2xl">
          {/* <ProductForm
            initialData={{
              id: product.id,
              title: product.title,
              shortDescription: product.shortDescription,
              description: product.description,
              price: product.price,
              imageSmall: product.imageSmall,
            }}
          /> */}
        </div>
        <div>
          {product.imageMedium || product.imageLarge ? (
            <div className="sticky top-8">
              <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-200">
                <Image
                  src={product.imageLarge || product.imageMedium || ""}
                  alt={product.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          ) : (
            <div className="sticky top-8">
              <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                Немає зображення
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
