import { ProductForm } from '@/components/ProductForm'

export default function NewProductPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Новий товар</h1>
      <div className="max-w-2xl">
        <ProductForm />
      </div>
    </div>
  )
}
