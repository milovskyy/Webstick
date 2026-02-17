import { Queue } from "bullmq"

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
}

export const imageQueue = new Queue("imageQueue", { connection })

export const imageResizeQueue = new Queue("imageResizeQueue", { connection })

export type ImageResizeJobData = {
  productId: string
  imageId: string
  originalImagePath: string
}

/**
 * Add a job to resize product image in background.
 * Safe to call from API: if Redis is down, logs and returns without throwing.
 */
export async function addImageResizeJob(
  productId: string,
  imageId: string,
  originalImagePath: string
): Promise<void> {
  try {
    await imageResizeQueue.add(
      "resize",
      { productId, imageId, originalImagePath } satisfies ImageResizeJobData,
      { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
    )
  } catch (err) {
    console.error("addImageResizeJob: queue unavailable, skipping background resize:", err)
  }
}
