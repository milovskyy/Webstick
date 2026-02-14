"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { CgScreen } from "react-icons/cg"
import { FiFileText, FiSidebar } from "react-icons/fi"
import { IoIosArrowDown } from "react-icons/io"
import { LuFolders } from "react-icons/lu"

const menuItems = [
  {
    title: "Дашборд",
    href: "/",
    icon: <CgScreen />,
  },
  {
    title: "Замовлення",
    href: "/orders",
    icon: <FiFileText />,
  },
  {
    title: "Каталог",
    icon: <LuFolders />,
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

export function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  return (
    <aside
      className={cn(
        "hidden flex-col bg-[#F8F9FB] text-sm text-white transition-all duration-300 xl:flex",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "h-[61px]",

          isCollapsed
            ? "flex flex-col items-center gap-1 pt-4"
            : "flex items-center justify-between p-6 pb-2"
        )}
      >
        {isCollapsed ? (
          <button onClick={toggleSidebar} aria-label="Toggle sidebar">
            <Image src="/Biksico-mini.png" alt="logo" width={35} height={45} />
          </button>
        ) : (
          <div className="flex w-full justify-between">
            <Link href={`/`}>
              <Image src="/Biksico.png" alt="logo" width={103} height={29} />
            </Link>
            <button
              onClick={toggleSidebar}
              className="ml-2 flex items-center justify-center rounded p-[6px] text-[#3F3F46] transition-colors hover:bg-[#E4E4E7]"
              aria-label="Toggle sidebar"
            >
              <FiSidebar size={16} />
            </button>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-4 text-[#3F3F46]">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div
                onClick={() => {
                  if (isCollapsed) router.push("/products")
                }}
                className={cn(
                  isCollapsed &&
                    isActive(item.children[0].href) &&
                    "bg-[#E4E4E7] font-medium text-[#09090B]"
                )}
              >
                <button
                  onClick={() => {
                    toggleItem(item.title)
                  }}
                  className={cn(
                    "flex w-full items-center px-2 py-[6px] transition-colors hover:bg-[#E4E4E7]",
                    isCollapsed ? "justify-center py-[9px]" : "justify-between"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <span
                    className={`flex items-center ${
                      isCollapsed ? "" : "gap-2"
                    }`}
                  >
                    <span className="flex w-4 flex-shrink-0 items-center justify-center">
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.title}</span>}
                  </span>
                  {!isCollapsed && (
                    <span
                      className={cn(
                        "rotate-0 transition-transform duration-300",
                        openItems.includes(item.title) && "rotate-90"
                      )}
                    >
                      <IoIosArrowDown size={16} />
                    </span>
                  )}
                </button>
                {!isCollapsed && (
                  <div
                    className={cn(
                      "duration-400 ml-4 flex h-0 flex-col gap-1 overflow-hidden border-l border-l-[#E5E7EB] pl-2 pr-6 pt-1 transition-all ease-in-out",
                      openItems.includes(item.title) && "h-48"
                    )}
                  >
                    {!isCollapsed && openItems.includes(item.title) && (
                      <>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              `flex rounded-[6px] px-2 py-1 transition-colors hover:bg-[#E4E4E7]`,
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
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-[6px] ring-[#A1A1AA] transition-colors hover:bg-[#E4E4E7]",
                  isCollapsed ? "h-8 justify-center py-2" : "gap-2",
                  isActive(item.href) &&
                    "bg-[#E4E4E7] font-medium text-[#09090B]"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <span className="flex w-4 flex-shrink-0 items-center justify-center">
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
