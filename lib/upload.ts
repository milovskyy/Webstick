import { writeFile, unlink } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { ensureUploadDirs } from "./image"
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from "./constants"

export async function saveUploadedFile(file: File) {
  if (!file) {
    throw new Error("File not provided")
  }

  const isImage = file.type.startsWith("image/")
  const isVideo = file.type.startsWith("video/")

  if (!isImage && !isVideo) {
    throw new Error("Only image and video files are allowed")
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image exceeds 10MB limit")
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new Error("Video exceeds 100MB limit")
  }

  await ensureUploadDirs()

  const ext = path.extname(file.name)
  const filename = `${randomUUID()}${ext}`

  const originalPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "original",
    filename
  )

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  await writeFile(originalPath, buffer)

  return {
    filename,
    originalPath,
    publicOriginalPath: `/uploads/original/${filename}`,
  }
}

export async function removeFileIfExists(filePath: string) {
  try {
    await unlink(filePath)
  } catch {
    console.error(`File not found: ${filePath}`)
  }
}
