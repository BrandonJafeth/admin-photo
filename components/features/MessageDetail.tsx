'use client'

export default function MessageDetail({ id }: { id?: string }) {
  return (
    <section>
      <h1 className="text-2xl font-bold">Mensaje {id}</h1>
      <p className="text-sm text-gray-600 mt-2">Detalle del mensaje.</p>
    </section>
  )
}
