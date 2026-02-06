import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { imageQueue } from '@/lib/queue'
import { ensureUploadDirs } from '@/lib/image'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

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

    let imageOriginal = product.imageOriginal

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

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        title,
        shortDescription: shortDescription || null,
        description: description || null,
        price,
        imageOriginal,
        // TODO: Clear old image sizes when new image is uploaded
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}
