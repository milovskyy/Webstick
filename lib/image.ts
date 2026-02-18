import sharp from "sharp"
import { promises as fs } from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

export async function ensureUploadDirs() {
  const dirs = [
    path.join(UPLOAD_DIR, "original"),
    path.join(UPLOAD_DIR, "small"),
    path.join(UPLOAD_DIR, "medium"),
    path.join(UPLOAD_DIR, "large"),
  ]

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true })
  }
}

export async function resizeImage(
  inputPath: string,
  outputPath: string,
  size: number
): Promise<void> {
  await sharp(inputPath)
    .resize(size, size, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFile(outputPath)
}
