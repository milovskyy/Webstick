import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/ProductForm"
import { notFound } from "next/navigation"

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true },
  })

  if (!product) notFound()

  return (
    <div className="flex h-full w-full justify-center bg-[#F8F9FB] p-5 pb-8">
      <ProductForm mode="edit" product={product} />
    </div>
  )
}
