import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { resizeImage, IMAGE_SIZES } from '../lib/image'
import { prisma } from '../lib/prisma'
import path from 'path'
import { promises as fs } from 'fs'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const worker = new Worker(
  'image-processing',
  async (job) => {
    const { originalPath, filename } = job.data

    console.log(`Processing image: ${filename}`)

    try {
      // Generate all sizes
      const sizes = ['small', 'medium', 'large'] as const

      for (const size of sizes) {
        const outputPath = path.join(
          process.cwd(),
          'public',
          'uploads',
          size,
          filename
        )

        await resizeImage(originalPath, outputPath, IMAGE_SIZES[size])

        console.log(`Generated ${size} image: ${filename}`)
      }

      // Update product with image paths
      const imageOriginal = `/uploads/original/${filename}`
      const imageSmall = `/uploads/small/${filename}`
      const imageMedium = `/uploads/medium/${filename}`
      const imageLarge = `/uploads/large/${filename}`

      // Find product by original image path
      const product = await prisma.product.findFirst({
        where: { imageOriginal },
      })

      if (product) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            imageSmall,
            imageMedium,
            imageLarge,
          },
        })

        console.log(`Updated product ${product.id} with image paths`)
      } else {
        console.warn(`Product not found for image: ${imageOriginal}`)
      }
    } catch (error) {
      console.error(`Error processing image ${filename}:`, error)
      throw error
    }
  },
  {
    connection,
    concurrency: 2, // Process 2 images at a time
  }
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

console.log('Image processing worker started')

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...')
  await worker.close()
  await connection.quit()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...')
  await worker.close()
  await connection.quit()
  process.exit(0)
})
