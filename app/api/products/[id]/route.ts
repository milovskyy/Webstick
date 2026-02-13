import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { imageQueue } from "@/lib/queue"
import { saveUploadedFile, removeFileIfExists } from "@/lib/upload"
import path from "path"
import { promises as fs } from "fs"

function extractFilename(filePath: string | null) {
  if (!filePath) return null
  return filePath.split("/").pop() || null
}

async function deleteProductImages(filename: string | null) {
  if (!filename) return

  const sizes = ["small", "medium", "large"]

  for (const size of sizes) {
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      size,
      filename
    )

    try {
      await fs.unlink(filePath)
    } catch {
      // ignore
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const formData = await request.formData()

    const title = formData.get("title") as string
    const shortDescription = formData.get("shortDescription") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const imageFile = formData.get("image") as File | null

    if (!title || isNaN(price)) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      )
    }

    let updateData: any = {
      title,
      shortDescription: shortDescription || null,
      description: description || null,
      price,
    }

    // Если загружена новая картинка
    if (imageFile && imageFile.size > 0) {
      // Удаляем старые файлы
      const oldFilename = extractFilename(existingProduct.imageSmall)
      await deleteProductImages(oldFilename)

      // Сохраняем новый оригинал
      const { filename, originalPath } = await saveUploadedFile(imageFile)

      // Обнуляем старые размеры
      updateData.imageSmall = null
      updateData.imageMedium = null
      updateData.imageLarge = null

      await prisma.product.update({
        where: { id: params.id },
        data: updateData,
      })

      // Запускаем очередь
      await imageQueue.add(
        "resize-image",
        {
          productId: params.id,
          originalPath,
          filename,
        },
        {
          attempts: 5,
          backoff: { type: "exponential", delay: 2000 },
        }
      )

      const updatedProduct = await prisma.product.findUnique({
        where: { id: params.id },
      })

      return NextResponse.json(updatedProduct)
    }

    // Если картинка не менялась
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedProduct)
  } catch (error: any) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const filename = extractFilename(product.imageSmall)

    await deleteProductImages(filename)

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
