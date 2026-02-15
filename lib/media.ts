const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv|ogv)(\?|$)/i

export function isVideoUrl(url: string) {
  return VIDEO_EXT.test(url)
}
