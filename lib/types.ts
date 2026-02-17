import { Product } from "@prisma/client"

export type ProductImage = {
  id: string
  original: string
  small?: string | null
  medium?: string | null
  large?: string | null
}

export type ProductFormProps = {
  mode: "create" | "edit"
  product?: Product & { images?: ProductImage[] }
}

export type CombinedMediaItem =
  | {
      key: string
      url: string
      isVideo: boolean
      isNew: true
      newIndex: number
    }
  | {
      key: string
      id: string
      url: string
      isVideo: boolean
      isNew: false
    }

export type MenuItemChild = { title: string; href: string }
export type MenuItem =
  | { title: string; href: string; icon: React.ReactNode }
  | { title: string; icon: React.ReactNode; children: MenuItemChild[] }
