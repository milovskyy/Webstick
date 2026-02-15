import { prisma } from "@/lib/prisma"
import { isVideoUrl } from "@/lib/media"

export function getFirstPhotoUrl(
  images: {
    small: string | null
    medium: string | null
    large?: string | null
    original: string
  }[]
) {
  const first = images.find((img) => {
    const url = img.small ?? img.medium ?? img.large ?? img.original
    return url && !isVideoUrl(url)
  })
  if (!first) return null
  return first.small ?? first.medium ?? first.large ?? first.original ?? null
}

export async function getProducts() {
  try {
    const rows = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true },
    })
    return rows.map((p) => ({
      ...p,
      imageSmall: getFirstPhotoUrl(p.images),
    }))
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function getProduct(id: string) {
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
