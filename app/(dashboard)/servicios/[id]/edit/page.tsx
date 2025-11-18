'use client'

import ServicesManager from '@/components/features/ServicesManager'
import { useParams } from 'next/navigation'

export default function EditServicioPage() {
  const params = useParams()
  const id = params?.id

  return (
    <div>
      <h1 className="text-2xl font-bold">Editar Servicio {id}</h1>
      <ServicesManager />
    </div>
  )
}
