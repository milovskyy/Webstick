export default function Dashboard() {
  return (
    <div className="p-8 h-full w-full bg-[#F8F9FB]">
      <h1 className="text-3xl font-bold mb-4">Дашборд</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Товари</h2>
          <p className="text-3xl font-bold">0</p>
          {/* TODO: Fetch and display actual product count */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Замовлення</h2>
          <p className="text-3xl font-bold">0</p>
          {/* TODO: Fetch and display actual order count */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Доходи</h2>
          <p className="text-3xl font-bold">0 ₴</p>
          {/* TODO: Fetch and display actual revenue */}
        </div>
      </div>
    </div>
  )
}
