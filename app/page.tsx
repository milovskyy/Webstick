import { getProducts } from "@/lib/products"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const products = await getProducts()
  return (
    <div className="h-full w-full bg-[#F8F9FB] p-8">
      <h1 className="mb-4 text-3xl font-bold">Дашборд</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold">Товари</h2>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold">Замовлення</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold">Доходи</h2>
          <p className="text-3xl font-bold">0 ₴</p>
        </div>
      </div>
    </div>
  )
}
