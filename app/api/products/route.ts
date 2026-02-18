import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import { randomUUID } from "crypto"
import path from "path"
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_TITLE,
  MAX_SHORT,
  MAX_DESC,
} from "@/lib/constants"
import { addImageResizeJob } from "@/lib/queue"

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
    if (title.length > MAX_TITLE) {
      return NextResponse.json(
        { error: `Назва не більше ${MAX_TITLE} символів` },
        { status: 400 }
      )
    }
    if (shortDescription && shortDescription.length > MAX_SHORT) {
      return NextResponse.json(
        { error: `Короткий опис не більше ${MAX_SHORT} символів` },
        { status: 400 }
      )
    }
    if (description && description.length > MAX_DESC) {
      return NextResponse.json(
        { error: `Опис не більше ${MAX_DESC} символів` },
        { status: 400 }
      )
    }
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Коректна ціна обов'язкова" },
        { status: 400 }
      )
    }
    if (discountPrice != null && discountPrice > 0 && discountPrice > price) {
      return NextResponse.json(
        {
          error: "Ціна зі знижкою не може бути вищою за звичайну ціну",
        },
        { status: 400 }
      )
    }

    for (const file of images) {
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

      const created = await prisma.productImage.create({
        data: {
          productId: product.id,
          original: `/uploads/products/${product.id}/original/${fileName}`,
        },
      })
      if (file.type.startsWith("image/")) {
        await addImageResizeJob(
          product.id,
          created.id,
          created.original
        )
      }
    }

    const productWithImages = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true },
    })

    revalidatePath("/products")
    return NextResponse.json(productWithImages ?? product, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating product:", error)
    const message =
      error instanceof Error ? error.message : "Failed to create product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
