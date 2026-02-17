import { MonitorCheck } from "lucide-react"
import { FiFileText } from "react-icons/fi"
import { LuFolders } from "react-icons/lu"
import { MenuItem } from "./types"

export const MAX_TITLE = 200
export const MAX_SHORT = 300
export const MAX_DESC = 5000
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024
export const ACCEPT_MEDIA = "image/*,video/*"

export const DEFAULT_PAGE_SIZE = 10

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const

export const MENU_ITEMS: MenuItem[] = [
  {
    title: "Дашборд",
    href: "/",
    icon: <MonitorCheck size={16} />,
  },
  {
    title: "Замовлення",
    href: "/orders",
    icon: <FiFileText size={16} />,
  },
  {
    title: "Каталог",
    icon: <LuFolders size={16} />,
    children: [
      { title: "Товари", href: "/products" },
      { title: "Залишки", href: "/inventory" },
      { title: "Категорії", href: "/categories" },
      { title: "Колекції", href: "/collections" },
      { title: "Лейбли", href: "/labels" },
      { title: "Бренди", href: "/brands" },
    ],
  },
]
