'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { CgScreen } from 'react-icons/cg'
import { FiFileText } from 'react-icons/fi'
import { LuFolders } from 'react-icons/lu'
import { HiMenu, HiX } from 'react-icons/hi'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Дашборд',
    href: '/',
    icon: <CgScreen />,
  },
  {
    title: 'Замовлення',
    href: '/orders',
    icon: <FiFileText />,
  },
  {
    title: 'Каталог',
    icon: <LuFolders />,
    children: [
      { title: 'Товари', href: '/products' },
      { title: 'Залишки', href: '/inventory' },
      { title: 'Категорії', href: '/categories' },
      { title: 'Колекції', href: '/collections' },
      { title: 'Лейбли', href: '/labels' },
      { title: 'Бренди', href: '/brands' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    )
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
    // Закрываем все открытые подменю при сворачивании
    if (!isCollapsed) {
      setOpenItems([])
    }
  }

  const isActive = (href: string) => pathname === href

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } bg-[#F8F9FB] text-white flex flex-col transition-all duration-300`}
    >
      <div
        className={cn(
          'p-4 flex items-center',
          isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'
        )}
      >
        {isCollapsed ? (
          <>
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-[#F8F9FB] font-bold text-sm">B</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-center"
              aria-label="Toggle sidebar"
            >
              <HiMenu size={20} />
            </button>
          </>
        ) : (
          <>
            <Image src="/Biksico.png" alt="logo" width={103} height={29} />
            <button
              onClick={toggleSidebar}
              className="ml-2 p-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-center"
              aria-label="Toggle sidebar"
            >
              <HiX size={20} />
            </button>
          </>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleItem(item.title)}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } p-3 rounded hover:bg-gray-700 transition-colors`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <span
                    className={`flex items-center ${
                      isCollapsed ? '' : 'gap-2'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && <span>{item.title}</span>}
                  </span>
                  {!isCollapsed && (
                    <span
                      className={
                        openItems.includes(item.title) ? 'rotate-90' : ''
                      }
                    >
                      ▶
                    </span>
                  )}
                </button>
                {!isCollapsed && openItems.includes(item.title) && (
                  <div className="ml-4 mt-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block p-2 rounded hover:bg-gray-700 transition-colors ${
                          isActive(child.href) ? 'bg-gray-700' : ''
                        }`}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : 'gap-2'
                } p-3 rounded hover:bg-gray-700 transition-colors`}
                title={isCollapsed ? item.title : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
