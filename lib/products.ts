import { prisma } from "@/lib/prisma"
import { isVideoUrl } from "@/lib/media"

export type ProductsMeta = {
  total: number
  page: number
  perPage: number
  totalPages: number
}

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

export async function getProductsPaginated(
  page: number,
  perPage: number,
  search?: string
): Promise<{
  data: Awaited<ReturnType<typeof getProducts>>
  meta: ProductsMeta
}> {
  try {
    const normalizedPage = Math.max(1, page)
    const normalizedPerPage = Math.max(1, Math.min(100, perPage))
    const skip = (normalizedPage - 1) * normalizedPerPage

    const where = (() => {
      const q = search?.trim()
      if (!q) return undefined
      return {
        OR: [{ title: { contains: q } }, { shortDescription: { contains: q } }],
      }
    })()

    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: normalizedPerPage,
        include: { images: true },
      }),
      prisma.product.count({ where }),
    ])

    const data = rows.map((p) => ({
      ...p,
      imageSmall: getFirstPhotoUrl(p.images),
    }))

    return {
      data,
      meta: {
        total,
        page: normalizedPage,
        perPage: normalizedPerPage,
        totalPages: Math.max(1, Math.ceil(total / normalizedPerPage)),
      },
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        perPage: perPage,
        totalPages: 1,
      },
    }
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
