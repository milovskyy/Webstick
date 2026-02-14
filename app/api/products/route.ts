import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import { randomUUID } from "crypto"
import path from "path"

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get("page") || "1")
    const perPage = parseInt(searchParams.get("perPage") || "10")

    const skip = (page - 1) * perPage

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
        include: { images: true },
      }),
      prisma.product.count(),
    ])

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const title = (formData.get("title") as string)?.trim()
    const shortDescription =
      (formData.get("shortDescription") as string)?.trim() || null
    const description = (formData.get("description") as string)?.trim() || null
    const price = Number(formData.get("price"))
    const costPrice = Number(formData.get("costPrice")) || 0
    const discountPriceRaw = formData.get("discountPrice")
    const discountPrice =
      discountPriceRaw !== null &&
      discountPriceRaw !== undefined &&
      String(discountPriceRaw).trim() !== ""
        ? Number(discountPriceRaw)
        : null

    const imagesRaw = formData.getAll("images")
    const images = imagesRaw.filter(
      (f): f is File => f instanceof File && f.size > 0
    )

    if (!title || title.length === 0) {
      return NextResponse.json({ error: "Назва обов'язкова" }, { status: 400 })
    }
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Коректна ціна обов'язкова" },
        { status: 400 }
      )
    }

    for (const file of images) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Дозволені лише зображення" },
          { status: 400 }
        )
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: "Розмір зображення не більше 10 МБ" },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.create({
      data: {
        title,
        shortDescription,
        description,
        price,
        costPrice: isNaN(costPrice) ? 0 : costPrice,
        discountPrice,
      },
    })

    const uploadBase = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products",
      product.id
    )

    for (const file of images) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext =
        file.name && /\.\w+$/.test(file.name)
          ? path.extname(file.name).toLowerCase()
          : ".jpg"
      const fileName =
        randomUUID() + (ext === ".jpg" || ext === ".jpeg" ? ".jpg" : ext)

      const originalDir = path.join(uploadBase, "original")
      await fs.mkdir(originalDir, { recursive: true })

      const filePath = path.join(originalDir, fileName)
      await fs.writeFile(filePath, buffer)

      await prisma.productImage.create({
        data: {
          productId: product.id,
          original: `/uploads/products/${product.id}/original/${fileName}`,
        },
      })
    }

    revalidatePath("/products")
    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating product:", error)
    const message =
      error instanceof Error ? error.message : "Failed to create product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
