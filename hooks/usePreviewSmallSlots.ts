import { useEffect, useState } from "react"

const PREVIEW_SMALL_SLOTS_MIN = 3

export function usePreviewSmallSlots(): number {
  const [slots, setSlots] = useState(PREVIEW_SMALL_SLOTS_MIN)

  useEffect(() => {
    const media = [
      { q: "(min-width: 1280px)", v: 7 },
      { q: "(min-width: 1024px)", v: 6 },
      { q: "(min-width: 768px)", v: 5 },
      { q: "(min-width: 640px)", v: 4 },
    ] as const
    const mql = media.map(({ q }) => window.matchMedia(q))

    const update = () => {
      let v = PREVIEW_SMALL_SLOTS_MIN
      for (let i = 0; i < mql.length; i++) {
        if (mql[i].matches) {
          v = media[i].v
          break
        }
      }
      setSlots(v)
    }

    update()
    mql.forEach((m) => m.addEventListener("change", update))
    return () => mql.forEach((m) => m.removeEventListener("change", update))
  }, [])

  return slots
}
