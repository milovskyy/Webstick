// import { Worker } from "bullmq"
// import Redis from "ioredis"
// import { resizeImage, IMAGE_SIZES } from "../lib/image"
// import { prisma } from "../lib/prisma"
// import path from "path"
// import { promises as fs } from "fs"

// const connection = new Redis(process.env.REDIS_URL || "redis://redis:6379")

// const worker = new Worker(
//   "image-processing",
//   async (job) => {
//     const { productId, originalPath, filename } = job.data

//     console.log(`Processing image for product ${productId}`)

//     const sizes = ["small", "medium", "large"] as const

//     try {
//       for (const size of sizes) {
//         const outputPath = path.join(
//           process.cwd(),
//           "public",
//           "uploads",
//           size,
//           filename
//         )

//         await resizeImage(originalPath, outputPath, IMAGE_SIZES[size])
//       }

//       // удаляем оригинал
//       await fs.unlink(originalPath)

//       await prisma.product.update({
//         where: { id: productId },
//         data: {
//           imageSmall: `/uploads/small/${filename}`,
//           imageMedium: `/uploads/medium/${filename}`,
//           imageLarge: `/uploads/large/${filename}`,
//         },
//       })

//       console.log(`Product ${productId} updated`)
//     } catch (error) {
//       console.error("Image processing failed:", error)
//       throw error
//     }
//   },
//   {
//     connection,
//     concurrency: 3,
//   }
// )

// worker.on("completed", (job) => {
//   console.log(`Job ${job.id} completed`)
// })

// worker.on("failed", (job, err) => {
//   console.error(`Job ${job?.id} failed:`, err)
// })

// process.on("SIGTERM", async () => {
//   console.log("Graceful shutdown...")
//   await worker.close()
//   await connection.quit()
//   process.exit(0)
// })

// process.on("SIGINT", async () => {
//   console.log("Graceful shutdown...")
//   await worker.close()
//   await connection.quit()
//   process.exit(0)
// })

// console.log("Image worker started")
