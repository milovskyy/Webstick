import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const PUBLIC_ROOT = path.join(process.cwd(), "public")

/**
 * Serve static assets from public folder (root-level files like Biksico.png, image-placeholder.png).
 * Use URL /assets/filename (e.g. /assets/Biksico.png) so standalone/Docker serves them correctly.
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

  const filePath = path.join(PUBLIC_ROOT, safePath)
  if (!filePath.startsWith(PUBLIC_ROOT)) {
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
              : ext === ".svg"
                ? "image/svg+xml"
                : ext === ".ico"
                  ? "image/x-icon"
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
    console.error("assets route error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
