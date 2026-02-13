import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { imageQueue } from "@/lib/queue"
import { saveUploadedFile } from "@/lib/upload"

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

    const title = formData.get("title") as string
    const shortDescription = formData.get("shortDescription") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const costPrice = parseFloat(formData.get("costPrice") as string)
    const discountPrice = parseFloat(formData.get("discountPrice") as string)
    const imageFile = formData.get("image") as File | null
    const images = formData.getAll("image") as File[]

    if (!title || isNaN(price)) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      )
    }

    // 1️⃣ Сначала создаём продукт без картинок
    const product = await prisma.product.create({
      data: {
        title,
        shortDescription: shortDescription || null,
        description: description || null,
        price,
        costPrice,
        discountPrice,
      },
    })

    // 2️⃣ Если есть изображение — сохраняем и запускаем очередь
    if (imageFile && imageFile.size > 0) {
      const { filename, originalPath } = await saveUploadedFile(imageFile)

      await imageQueue.add(
        "resize-image",
        {
          productId: product.id,
          originalPath,
          filename,
        },
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      )
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error("Error creating product:", error)

    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    )
  }
}

// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { imageQueue } from "@/lib/queue"
// import { ensureUploadDirs } from "@/lib/image"
// import { writeFile } from "fs/promises"
// import path from "path"

// export async function GET() {
//   try {
//     const products = await prisma.product.findMany({
//       orderBy: { createdAt: "desc" },
//     })
//     return NextResponse.json(products)
//   } catch (error) {
//     console.error("Error fetching products:", error)
//     return NextResponse.json(
//       { error: "Failed to fetch products" },
//       { status: 500 }
//     )
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()
//     const title = formData.get("title") as string
//     const shortDescription = formData.get("shortDescription") as string
//     const description = formData.get("description") as string
//     const price = parseFloat(formData.get("price") as string)
//     const imageFile = formData.get("image") as File | null

//     if (!title || isNaN(price)) {
//       return NextResponse.json(
//         { error: "Title and price are required" },
//         { status: 400 }
//       )
//     }

//     let imageOriginal: string | null = null

//     if (imageFile && imageFile.size > 0) {
//       await ensureUploadDirs()

//       const bytes = await imageFile.arrayBuffer()
//       const buffer = Buffer.from(bytes)
//       const filename = `${Date.now()}-${imageFile.name}`
//       const originalPath = path.join(
//         process.cwd(),
//         "public",
//         "uploads",
//         "original",
//         filename
//       )

//       await writeFile(originalPath, buffer)
//       imageOriginal = `/uploads/original/${filename}`

//       // Enqueue image processing job
//       await imageQueue.add("resize-image", {
//         originalPath,
//         filename,
//       })
//     }

//     const product = await prisma.product.create({
//       data: {
//         title,
//         shortDescription: shortDescription || null,
//         description: description || null,
//         price,
//         imageOriginal,
//       },
//     })

//     return NextResponse.json(product, { status: 201 })
//   } catch (error) {
//     console.error("Error creating product:", error)
//     return NextResponse.json(
//       { error: "Failed to create product" },
//       { status: 500 }
//     )
//   }
// }
