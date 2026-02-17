"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiPlus } from "react-icons/fi"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ProductsMeta } from "@/lib/products"
import { DeleteProductModal } from "./DeleteProductModal"
import { ProductRow } from "./ProductRow"
import { ProductsPagination } from "./ProductsPagination"
import { SearchInput } from "./SearchInput"

type Product = {
  id: string
  title: string
  shortDescription: string | null
  price: number
  imageSmall: string | null
}

type Props = {
  products: Product[]
  meta: ProductsMeta
  currentSearch: string
}

function buildProductsUrl(params: {
  page: number
  perPage: number
  search: string
}): string {
  const sp = new URLSearchParams()
  if (params.page > 1) sp.set("page", String(params.page))
  if (params.perPage !== DEFAULT_PAGE_SIZE)
    sp.set("perPage", String(params.perPage))
  if (params.search) sp.set("search", params.search)
  const q = sp.toString()
  return q ? `/products?${q}` : "/products"
}

export function ProductsList({ products, meta, currentSearch }: Props) {
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [searchInputValue, setSearchInputValue] = useState(currentSearch)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    setSearchInputValue(currentSearch)
  }, [currentSearch])

  const applySearch = useCallback(
    (search: string) => {
      router.push(
        buildProductsUrl({
          page: 1,
          perPage: meta.perPage,
          search: search.trim(),
        })
      )
    },
    [router, meta.perPage]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInputValue(value)
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = setTimeout(() => {
        applySearch(value)
        searchTimeoutRef.current = null
      }, 400)
    },
    [applySearch]
  )

  const handleSearchClear = useCallback(() => {
    setSearchInputValue("")
    applySearch("")
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }
  }, [applySearch])

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handlePageChange = (newPage: number) => {
    router.push(
      buildProductsUrl({
        page: newPage,
        perPage: meta.perPage,
        search: currentSearch,
      })
    )
  }

  const handlePageSizeChange = (newPageSize: number) => {
    router.push(
      buildProductsUrl({
        page: 1,
        perPage: newPageSize,
        search: currentSearch,
      })
    )
  }

  const handleConfirmDelete = async (id: string) => {
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

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4 sm:gap-6">
      {isDeleteModalOpen && productToDelete && (
        <DeleteProductModal
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={() => handleConfirmDelete(productToDelete.id)}
        />
      )}
      <div className="flex w-full gap-2 px-4 sm:ml-[1px] sm:max-w-[400px] sm:px-0">
        <div className="relative flex w-full flex-1 items-center">
          <SearchInput
            query={searchInputValue}
            setQuery={handleSearchChange}
            onClear={handleSearchClear}
          />
        </div>
        <Link
          href="/products/new"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#2563EB] text-[#F8F9FB] hover:bg-[#3A72ED] sm:hidden"
          aria-label="Додати товар"
        >
          <FiPlus size={16} strokeWidth={3} className="text-[#F8F9FB]" />
        </Link>
      </div>

      <div
        className={cn(
          "flex w-full flex-col overflow-hidden max-sm:flex-1 sm:rounded-2xl sm:border sm:border-[#E4E4E7]",
          products.length === 0 && "h-full"
        )}
      >
        <div className="hidden h-10 items-center justify-between border-b border-[#E4E4E7] bg-[#F4F4F5] pl-2 pr-12 text-sm font-medium text-[#A1A1AA] sm:flex">
          Назва
        </div>
        {products.length === 0 ? (
          currentSearch ? (
            <div className="flex flex-1 items-center justify-center bg-white py-12 text-center">
              <p className="w-[210px] text-sm text-[#A1A1AA]">
                За вашим запитом нічого не знайдено
              </p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <p className="mb-2 text-sm text-gray-500">Немає товарів</p>
              <Link
                href="/products/new"
                className="text-blue-600 hover:underline"
              >
                Створити перший товар
              </Link>
            </div>
          )
        ) : (
          <div id="products-grid" className="flex flex-col" role="list">
            {products.map((product) => (
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
        currentPage={meta.page}
        totalPages={meta.totalPages}
        pageSize={meta.perPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
