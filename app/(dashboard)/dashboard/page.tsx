export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl text-black font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1  md:grid-cols-3 gap-4">
        <div className="p-4 border bg-white border-rounded border-slate-200 rounded-lg">
          <h3 className="text-black font-semibold">Total Servicios</h3>
          <p className="text-3xl text-black font-bold mt-2">4</p>
        </div>
        <div className="p-4 border bg-white border-rounded border-slate-200 rounded-lg">
          <h3 className="text-black font-semibold">Mensajes Pendientes</h3>
          <p className="text-3xl text-black font-bold mt-2">12</p>
        </div>
        <div className="p-4 border bg-white border-rounded border-slate-200 rounded-lg">
          <h3 className="text-black font-semibold">Imágenes en Galería</h3>
          <p className="text-3xl text-black font-bold mt-2">156</p>
        </div>
      </div>
    </div>
  )
}
