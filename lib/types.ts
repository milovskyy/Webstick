import type {
  Product as PrismaProduct,
  ProductImage as PrismaProductImage,
} from "@prisma/client"

export type Product = PrismaProduct

export type ProductImage = PrismaProductImage

export type ProductWithImages = Product & { images: ProductImage[] }

export type ProductsMeta = {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type ProductRowProps = {
  product: ProductWithImages
  onDelete: () => void
}

export type ProductFormProps = {
  mode: "create" | "edit"
  product?: ProductWithImages
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
