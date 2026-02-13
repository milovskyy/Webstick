import { Queue } from "bullmq"
import Redis from "ioredis"

const connection = new Redis(process.env.REDIS_URL || "redis://redis:6379")

export const imageQueue = new Queue("image-processing", {
  connection,
})
