import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Open_Sans } from 'next/font/google'

const openSans = Open_Sans({
  subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
  title: 'E-commerce Admin',
  description: 'E-commerce admin panel',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk">
      <body className={openSans.className}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
