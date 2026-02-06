import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { imageQueue } from '@/lib/queue'
import { ensureUploadDirs } from '@/lib/image'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const shortDescription = formData.get('shortDescription') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const imageFile = formData.get('image') as File | null

    if (!title || isNaN(price)) {
      return NextResponse.json(
        { error: 'Title and price are required' },
        { status: 400 }
      )
    }

    let imageOriginal: string | null = null

    if (imageFile && imageFile.size > 0) {
      await ensureUploadDirs()

      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}-${imageFile.name}`
      const originalPath = path.join(
        process.cwd(),
        'public',
        'uploads',
        'original',
        filename
      )

      await writeFile(originalPath, buffer)
      imageOriginal = `/uploads/original/${filename}`

      // Enqueue image processing job
      await imageQueue.add('resize-image', {
        originalPath,
        filename,
      })
    }

    const product = await prisma.product.create({
      data: {
        title,
        shortDescription: shortDescription || null,
        description: description || null,
        price,
        imageOriginal,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
