import path from "path"
import fs from "fs/promises"
import sharp from "sharp"

export const RESIZE_WIDTHS = {
  small: 300,
  medium: 600,
  large: 1200,
} as const

export type ResizeResult = {
  small: string
  medium: string
  large: string
}

/**
 * Resize an original image to small (300px), medium (600px), large (1200px) width.
 * Saves to public/uploads/products/{productId}/small|medium|large/{fileName}.
 * @param originalImagePath - Web path e.g. /uploads/products/{productId}/original/{fileName}
 * @param productId - Product ID for output paths
 * @returns Web paths for small, medium, large
 */
export async function resizeProductImage(
  originalImagePath: string,
  productId: string
): Promise<ResizeResult> {
  const publicRoot = path.join(process.cwd(), "public")
  const absoluteOriginal = path.join(
    publicRoot,
    originalImagePath.replace(/^\//, "")
  )

  await fs.access(absoluteOriginal)

  const fileName = path.basename(originalImagePath)
  const baseDir = path.join(publicRoot, "uploads", "products", productId)
  const result: ResizeResult = { small: "", medium: "", large: "" }

  for (const [sizeName, width] of Object.entries(RESIZE_WIDTHS)) {
    const dir = path.join(baseDir, sizeName)
    await fs.mkdir(dir, { recursive: true })
    const outputPath = path.join(dir, fileName)

    await sharp(absoluteOriginal)
      .rotate()
      .resize({
        width,
        fit: "inside",
        withoutEnlargement: true,
      })
      .withMetadata()
      .jpeg({ quality: 85 })
      .toFile(outputPath)

    result[sizeName as keyof ResizeResult] =
      `/uploads/products/${productId}/${sizeName}/${fileName}`
  }

  return result
}
