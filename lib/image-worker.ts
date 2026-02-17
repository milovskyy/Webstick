import { Worker } from "bullmq"
import { resizeProductImage } from "@/lib/image-resize"
import { prisma } from "@/lib/prisma"
import type { ImageResizeJobData } from "@/lib/queue"

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
}

const worker = new Worker(
  "imageResizeQueue",
  async (job) => {
    const { productId, imageId, originalImagePath } = job.data as ImageResizeJobData

    if (!productId || !imageId || !originalImagePath) {
      throw new Error("Missing productId, imageId or originalImagePath in job data")
    }

    try {
      const result = await resizeProductImage(originalImagePath, productId)

      await prisma.productImage.update({
        where: { id: imageId },
        data: {
          small: result.small,
          medium: result.medium,
          large: result.large,
        },
      })

      console.log(`Processed image ${imageId} (product ${productId})`)
    } catch (err) {
      console.error(`Image resize failed for imageId ${imageId}, productId ${productId}:`, err)
      throw err
    }
  },
  { connection }
)

worker.on("completed", (job) => {
  console.log("Image resize job completed:", job?.id)
})

worker.on("failed", (job, err) => {
  console.error("Image resize job failed:", job?.id, err?.message)
})

worker.on("error", (err) => {
  console.error("Image resize worker error:", err)
})

console.log("Image resize worker started, queue: imageResizeQueue")
