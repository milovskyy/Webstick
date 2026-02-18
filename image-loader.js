/**
 * Custom image loader for Next.js Image.
 * For /uploads/ we return the URL as-is so the browser loads the file directly
 * (avoids "isn't a valid image... received null" when optimizer can't read from public in Docker/standalone).
 * Other images use the default Next.js image optimization.
 */
module.exports = function loader({ src, width, quality }) {
  if (typeof src === "string" && (src.startsWith("/uploads/") || src.startsWith("/assets/"))) {
    return src
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
}
