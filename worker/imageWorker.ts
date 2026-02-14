import { Worker } from "bullmq"
import path from "path"
import fs from "fs/promises"
import sharp from "sharp"
import { prisma } from "../lib/prisma"

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
}

const SIZES = [
  { name: "small", width: 200 },
  { name: "medium", width: 600 },
  { name: "large", width: 1200 },
] as const

const worker = new Worker(
  "imageQueue",
  async (job) => {
    const { imageId, productId, fileName } = job.data as {
      imageId: string
      productId: string
      fileName: string
    }

    if (!imageId || !productId || !fileName) {
      throw new Error("Missing imageId, productId or fileName in job data")
    }

    const basePath = path.join(process.cwd(), "public", "uploads", "products", productId)
    const originalPath = path.join(basePath, "original", fileName)

    try {
      await fs.access(originalPath)
    } catch {
      throw new Error(`Original file not found: ${originalPath}`)
    }

    const updates: Record<string, string> = {}

    for (const size of SIZES) {
      try {
        const dir = path.join(basePath, size.name)
        await fs.mkdir(dir, { recursive: true })
        const outputPath = path.join(dir, fileName)

        await sharp(originalPath)
          .resize(size.width)
          .jpeg({ quality: 85 })
          .toFile(outputPath)

        updates[size.name] = `/uploads/products/${productId}/${size.name}/${fileName}`
      } catch (err) {
        console.error(`Worker failed for size ${size.name}, imageId ${imageId}:`, err)
        throw err
      }
    }

    await prisma.productImage.update({
      where: { id: imageId },
      data: updates,
    })

    console.log(`Processed image ${imageId} (product ${productId})`)
  },
  { connection }
)

worker.on("completed", (job) => {
  console.log("Job completed:", job.id)
})

worker.on("failed", (job, err) => {
  console.error("Job failed:", job?.id, err?.message)
})

worker.on("error", (err) => {
  console.error("Worker error:", err)
})

console.log("Image worker started, queue: imageQueue")
