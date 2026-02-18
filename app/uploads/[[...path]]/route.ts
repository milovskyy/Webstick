import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads")

/**
 * Serve uploaded files from public/uploads.
 * Ensures /uploads/* works in Docker/standalone when static serving fails.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await context.params
  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const safePath = pathSegments.filter((s) => s && !s.includes("..")).join(path.sep)
  if (!safePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const filePath = path.join(UPLOAD_ROOT, safePath)
  if (!filePath.startsWith(UPLOAD_ROOT)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const stat = await fs.stat(filePath)
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const body = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const contentType =
      ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : ext === ".mp4"
                ? "video/mp4"
                : ext === ".webm"
                  ? "video/webm"
                  : "application/octet-stream"
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    console.error("uploads route error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
