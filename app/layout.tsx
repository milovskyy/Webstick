import { Sidebar } from "@/components/Sidebar"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarMini } from "@/components/SidebarMini"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "E-commerce Admin",
  description: "E-commerce admin panel",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk">
      <body className={`${inter.className} `}>
        <div className="flex min-h-screen flex-col md:flex-row">
          <SidebarMini />
          <Sidebar />
          <main className="flex flex-1 flex-col overflow-auto sm:block">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
