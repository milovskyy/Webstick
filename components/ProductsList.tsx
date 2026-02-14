"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { FaXmark } from "react-icons/fa6"
import { FiSearch } from "react-icons/fi"
import { DeleteProductModal } from "./DeleteProductModal"
import { ProductRow } from "./ProductRow"
import { ProductsPagination } from "./ProductsPagination"
import { Input } from "./ui/input"

type Product = {
  id: string
  title: string
  shortDescription: string | null
  price: number
  imageSmall: string | null
}

type Props = {
  products: Product[]
}

function filterProducts(products: Product[], query: string): Product[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return products
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(normalized) ||
      (p.shortDescription?.toLowerCase().includes(normalized) ?? false)
  )
}

const DEFAULT_PAGE_SIZE = 10

export function ProductsList({ products }: Props) {
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  console.log("products", products)

  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const filteredProducts = useMemo(
    () => filterProducts(products, query),
    [products, query]
  )

  const totalItems = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const paginatedProducts = useMemo(
    () => filteredProducts.slice(start, start + pageSize),
    [filteredProducts, start, pageSize]
  )

  const handleDeleteClick = (product: Product) => {
    console.log("delete", product)
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
  }

  const handleConfirmDelete = async (id: string) => {
    console.log("delete", id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error("Delete failed:", data.error || res.statusText)
        return
      }
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      window.location.reload()
    } catch (e) {
      console.error("Delete failed:", e)
    }
  }

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages)
  }, [totalPages, page])

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {isDeleteModalOpen && productToDelete && (
        <DeleteProductModal
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={() => handleConfirmDelete(productToDelete.id)}
        />
      )}
      <div className="flex h-8 w-[400px]">
        <div className="relative ml-[1px] flex w-full flex-1 items-center">
          <label htmlFor="products-search" className="sr-only">
            Пошук товарів за назвою або описом
          </label>
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <div className="group/field w-full">
            <Input
              id="products-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук товару"
              className="w-full rounded-md border border-[#E4E4E7] bg-white py-2.5 pl-8 pr-4 text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0 disabled:opacity-50 group-hover/field:border-[#2563EB]"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-[#18181B] group-hover/field:border-[#2563EB]"
                aria-label="Очистити пошук"
                tabIndex={0}
              >
                <FaXmark size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E4E4E7]">
        <div className="flex h-10 items-center justify-between border-b border-[#E4E4E7] bg-[#F4F4F5] pl-2 pr-12 text-sm font-medium text-[#A1A1AA]">
          <p>Назва</p>
          {query && <p>Ціна</p>}
        </div>
        {query ? (
          filteredProducts.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-12 text-center">
              <p className="w-[210px] text-sm text-gray-500">
                За вашим запитом нічого не знайдено
              </p>
            </div>
          ) : (
            <div id="products-grid" className="flex flex-col" role="list">
              {paginatedProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onDelete={() => handleDeleteClick(product)}
                />
              ))}
            </div>
          )
        ) : products.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <p className="mb-2 text-sm text-gray-500">Немає товарів</p>
            <Link
              href="/products/new"
              className="text-blue-600 hover:underline"
            >
              Створити перший товар
            </Link>
          </div>
        ) : (
          <div id="products-grid" className="flex flex-col" role="list">
            {paginatedProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onDelete={() => handleDeleteClick(product)}
              />
            ))}
          </div>
        )}
      </div>

      <ProductsPagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
