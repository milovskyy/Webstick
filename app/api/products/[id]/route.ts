import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import path from "path"
import fs from "fs/promises"
import { randomUUID } from "crypto"

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB per image
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB per video

function uploadsRoot() {
  return path.join(process.cwd(), "public", "uploads", "products")
}

async function deleteProductFolder(productId: string) {
  const dir = path.join(uploadsRoot(), productId)
  try {
    await fs.rm(dir, { recursive: true })
  } catch (e) {
    console.error("deleteProductFolder:", e)
  }
}

async function deleteProductImage(imageId: string, productId: string) {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  })
  if (!image) return
  const publicRoot = path.join(process.cwd(), "public")
  const pathsToDelete = [image.original, image.small, image.medium, image.large]
    .filter((p): p is string => p != null && p !== "")
    .map((p) => path.join(publicRoot, p))
  for (const filePath of pathsToDelete) {
    try {
      await fs.unlink(filePath)
    } catch (e) {
      console.error("deleteProductImage unlink:", filePath, e)
    }
  }
  await prisma.productImage.delete({ where: { id: imageId } })
}

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

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
    const newImageFiles = imagesRaw.filter(
      (f): f is File => f instanceof File && f.size > 0
    )

    const removeImageIdsRaw = formData.get("removeImageIds")
    const removeImageIds: string[] =
      typeof removeImageIdsRaw === "string"
        ? (() => {
            try {
              return JSON.parse(removeImageIdsRaw)
            } catch {
              return []
            }
          })()
        : []

    if (!title || title.length === 0) {
      return NextResponse.json({ error: "Назва обов'язкова" }, { status: 400 })
    }
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Коректна ціна обов'язкова" },
        { status: 400 }
      )
    }

    for (const file of newImageFiles) {
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      if (!isImage && !isVideo) {
        return NextResponse.json(
          { error: "Дозволені лише зображення та відео" },
          { status: 400 }
        )
      }
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: "Розмір зображення не більше 10 МБ" },
          { status: 400 }
        )
      }
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: "Розмір відео не більше 100 МБ" },
          { status: 400 }
        )
      }
    }

    await prisma.product.update({
      where: { id },
      data: {
        title,
        shortDescription,
        description,
        price,
        costPrice: isNaN(costPrice) ? 0 : costPrice,
        discountPrice,
      },
    })

    for (const imageId of removeImageIds) {
      if (typeof imageId === "string" && imageId) {
        await deleteProductImage(imageId, id)
      }
    }

    const uploadBase = path.join(uploadsRoot(), id)

    for (const file of newImageFiles) {
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
          productId: id,
          original: `/uploads/products/${id}/original/${fileName}`,
        },
      })
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })
    return NextResponse.json(updatedProduct)
  } catch (error: unknown) {
    console.error("Error updating product:", error)
    const message =
      error instanceof Error ? error.message : "Failed to update product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await deleteProductFolder(id)
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
