import type {
  Product as PrismaProduct,
  ProductImage as PrismaProductImage,
} from "@prisma/client"

/** Product from DB (without relations). Re-export for single source of truth. */
export type Product = PrismaProduct

/** Product image from DB. Re-export for single source of truth. */
export type ProductImage = PrismaProductImage

/** Product with images included (e.g. from getProduct, getProducts, findUnique with include: { images: true }). */
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
