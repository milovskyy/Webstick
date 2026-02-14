import { Queue } from "bullmq"

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
}

export const imageQueue = new Queue("imageQueue", { connection })
