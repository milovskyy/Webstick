'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { CgScreen } from 'react-icons/cg'
import { FiFileText, FiSidebar } from 'react-icons/fi'
import { LuFolders } from 'react-icons/lu'
import { cn } from '@/lib/utils'
import { IoIosArrowDown } from 'react-icons/io'

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
    if (!isCollapsed) {
      setOpenItems([])
    }
  }

  const isActive = (href: string) => pathname === href

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } bg-[#F8F9FB] text-white flex flex-col transition-all duration-300 text-sm`}
    >
      <div
        className={cn(
          'h-[61px]',
          isCollapsed
            ? 'flex flex-col gap-1 items-center pt-4'
            : 'justify-between p-6 pb-2 flex items-center'
        )}
      >
        {isCollapsed ? (
          <>
            <button onClick={toggleSidebar} aria-label="Toggle sidebar">
              <Image
                src="/Biksico-mini.png"
                alt="logo"
                width={35}
                height={45}
              />
            </button>
          </>
        ) : (
          <div className="flex  justify-between w-full">
            <Image src="/Biksico.png" alt="logo" width={103} height={29} />
            <button
              onClick={toggleSidebar}
              className="ml-2 p-[6px] rounded hover:bg-[#E4E4E7] transition-colors flex items-center justify-center text-[#3F3F46] "
              aria-label="Toggle sidebar"
            >
              <FiSidebar size={16} />
            </button>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-4  text-[#3F3F46] ">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div>
                <button
                  onClick={() => {
                    console.log('clicked')
                    toggleItem(item.title)
                  }}
                  className={cn(
                    'w-full flex items-center p-2 hover:bg-[#E4E4E7] transition-colors',
                    isCollapsed ? 'justify-center' : 'justify-between'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <span
                    className={`flex items-center  ${
                      isCollapsed ? '' : 'gap-2'
                    }`}
                  >
                    <span className="flex-shrink-0 w-4 flex items-center justify-center">
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.title}</span>}
                  </span>
                  {!isCollapsed && (
                    <span
                      className={cn(
                        'rotate-90 transition-transform duration-300',
                        openItems.includes(item.title) && 'rotate-0 '
                      )}
                    >
                      <IoIosArrowDown size={16} />
                    </span>
                  )}
                </button>
                {!isCollapsed && openItems.includes(item.title) && (
                  <div
                    className={cn(
                      'ml-4 pl-2  border-l pr-6 border-l-[#E5E7EB] flex flex-col gap-1'
                    )}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          `block px-2 py-1 rounded-[6px] hover:bg-[#E4E4E7] transition-colors `,
                          isActive(child.href) &&
                            'bg-[#E4E4E7] font-medium text-[#09090B]'
                        )}
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
                className={cn(
                  'flex items-center px-2 py-[6px] hover:bg-[#E4E4E7] transition-colors',
                  isCollapsed ? 'justify-center py-2 h-8' : 'gap-2 ',
                  isActive(item.href) &&
                    'bg-[#E4E4E7] font-medium text-[#09090B]'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <span className="flex-shrink-0 w-4 flex items-center justify-center">
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
