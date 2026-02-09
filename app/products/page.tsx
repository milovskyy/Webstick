import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'

async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="pt-5 pb-8 pl-0 pr-5 bg-[#F8F9FB] h-full flex flex-col gap-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#3F3F46]">Товари</h1>

        <Link
          href="/products/new"
          className="px-4 flex items-center justify-center gap-2 py-2 bg-[#2563EB] text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus size={16} strokeWidth={3} className="text-white" />
          <p className="text-sm font-medium text-[#F8F9FB]">Додати</p>
        </Link>
      </div>




      <div className="flex flex-col gap-4"></div>





      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Немає товарів</p>
          <Link
            href="/products/new"
            className="text-blue-600 hover:underline"
          >
            Створити перший товар
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative w-full h-48 bg-gray-200">
                {product.imageSmall ? (
                  <Image
                    src={product.imageSmall}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Немає зображення
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                  {product.title}
                </h3>
                {product.shortDescription && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
                <p className="text-xl font-bold text-blue-600">
                  {product.price.toFixed(2)} ₴
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
