"use client"

import { cn } from "@/lib/utils"
import { MonitorCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { FiFileText, FiSidebar } from "react-icons/fi"
import { IoIosArrowDown } from "react-icons/io"
import { LuFolders } from "react-icons/lu"

const menuItems = [
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

export function SidebarMini() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(true)

  const pathname = usePathname()
  const router = useRouter()

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
    if (!isCollapsed) {
      setOpenItems([])
    }
  }

  const isActive = (href: string) => pathname === href

  const currentPage = (() => {
    for (const item of menuItems) {
      if (item.href && pathname === item.href) return item
      if (item.children) {
        const child = item.children.find((c) => pathname === c.href)
        if (child) return child
      }
    }
    return null
  })()

  if (!currentPage) return null

  return (
    <aside className="flex flex-col bg-[#F8F9FB] text-sm text-white transition-all duration-300 md:hidden">
      <div className="px-4 py-[10px]">
        <div className="flex h-7 w-full items-center gap-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded text-[#3F3F46] transition-colors",
              !isCollapsed && "bg-[#E4E4E7]"
            )}
            aria-label="Toggle sidebar"
          >
            <FiSidebar size={16} />
          </button>
          <div className="h-full min-w-2 border-l border-l-[#E4E4E7]" />
          <p className="text-sm text-[#A1A1AA]">{currentPage?.title}</p>
        </div>
      </div>
      {!isCollapsed && (
        <nav className="flex-1 overflow-y-auto px-4 pb-2 text-[#3F3F46]">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => {
                      toggleItem(item.title)
                    }}
                    className="flex w-full items-center justify-between px-2 py-[6px] transition-colors"
                    title={item.title}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex w-4 flex-shrink-0 items-center justify-center">
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </div>

                    <span
                      className={cn(
                        "rotate-90 transition-transform duration-300",
                        openItems.includes(item.title) && "rotate-0"
                      )}
                    >
                      <IoIosArrowDown size={16} />
                    </span>
                  </button>

                  <div
                    className={cn(
                      "duration-400 ml-4 flex h-0 flex-col gap-1 overflow-hidden border-l border-l-[#E5E7EB] pl-2 pr-6 pt-1 transition-all ease-in-out",
                      openItems.includes(item.title) && "h-48"
                    )}
                  >
                    {openItems.includes(item.title) && (
                      <>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              `flex rounded-[6px] px-2 py-1 transition-colors`,
                              isActive(child.href) &&
                                "bg-[#E4E4E7] font-medium text-[#09090B]"
                            )}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-2 py-[6px] ring-[#A1A1AA] transition-colors",
                    isActive(item.href) &&
                      "bg-[#E4E4E7] font-medium text-[#09090B]"
                  )}
                  title={item.title}
                >
                  <span className="flex w-4 flex-shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      )}
    </aside>
  )
}
