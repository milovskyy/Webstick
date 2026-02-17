"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiSidebar } from "react-icons/fi"
import { IoIosArrowDown } from "react-icons/io"

import { cn } from "@/lib/utils"
import { MENU_ITEMS } from "@/lib/constants"
import type { MenuItemChild } from "@/lib/types"

export function SidebarMini() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(true)

  const pathname = usePathname()

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

  const currentPage = useMemo(() => {
    for (const item of MENU_ITEMS) {
      if ("href" in item && pathname === item.href) return item
      if ("children" in item) {
        const child = item.children.find((c) => pathname === c.href)
        if (child) return child
      }
    }
    return null
  }, [pathname])

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
          {MENU_ITEMS.map((item) => (
            <div key={item.title}>
              {"children" in item ? (
                <div>
                  <button
                    onClick={() => toggleItem(item.title)}
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
                      "ml-4 flex h-0 flex-col gap-1 overflow-hidden border-l border-l-[#E5E7EB] pl-2 pr-6 pt-1 transition-all duration-300 ease-in-out",
                      openItems.includes(item.title) && "h-48 overflow-y-auto"
                    )}
                  >
                    {openItems.includes(item.title) &&
                      item.children.map((child: MenuItemChild) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex rounded-[6px] px-2 py-1 transition-colors",
                            isActive(child.href) &&
                              "bg-[#E4E4E7] font-medium text-[#09090B]"
                          )}
                        >
                          {child.title}
                        </Link>
                      ))}
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
