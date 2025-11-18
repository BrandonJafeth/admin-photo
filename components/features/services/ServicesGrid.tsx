'use client'

import { useState } from 'react'
import { Service } from '@/services/services.service'
import { useDeleteService, useUpdateService, useUpdateServicesOrder } from '@/hooks/useServices'
import { Button } from '@/components/ui/button'
import { Trash2, Eye, EyeOff, GripVertical, Pencil, Copy } from 'lucide-react'
import { ServiceEditSheet } from './ServiceEditSheet'


interface ServicesGridProps {
  services: Service[]
}

export function ServicesGrid({ services }: ServicesGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const deleteService = useDeleteService()
  const updateService = useUpdateService()
  const updateOrder = useUpdateServicesOrder()

  const editingService = services.find(svc => svc.id === editingId)

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    const draggedIndex = services.findIndex(svc => svc.id === draggedId)
    const targetIndex = services.findIndex(svc => svc.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newServices = [...services]
    const [draggedService] = newServices.splice(draggedIndex, 1)
    newServices.splice(targetIndex, 0, draggedService)

    const updates = newServices.map((svc, index) => ({
      id: svc.id,
      order: index,
    }))

    try {
      await updateOrder.mutateAsync(updates)
    } catch (error) {
      console.error('Error al actualizar orden:', error)
    }

    setDraggedId(null)
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await updateService.mutateAsync({
        id,
        payload: { is_active: !isVisible },
      })
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) return

    try {
      await deleteService.mutateAsync(id)
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  const handleDuplicate = async (service: Service) => {
    const newSlug = `${service.slug}-copia-${Date.now()}`
    try {
      // Crear copia del servicio
      const newService = {
        title: `${service.title} (Copia)`,
        slug: newSlug,
        description: service.description,
        detailed_description: service.detailed_description,
        image: service.image,
        gallery_images: service.gallery_images,
        cta_text: service.cta_text,
        cta_link: service.cta_link,
        features: service.features,
        pricing: service.pricing,
        is_active: false,
        order: services.length,
      }
      // Aquí iría la llamada a crear, pero por ahora solo mostramos el intent
      console.log('Duplicar servicio:', newService)
    } catch (error) {
      console.error('Error al duplicar:', error)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, index) => (
          <div
            key={service.id}
            draggable
            onDragStart={() => handleDragStart(service.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(service.id)}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-move ${
              draggedId === service.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 opacity-50'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            {/* Imagen */}
            <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                  <span className="text-slate-400 text-sm">Sin imagen</span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(service.id)
                    setIsSheetOpen(true)
                  }}
                  className="gap-1"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-2 bg-white dark:bg-slate-950">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{service.title}</p>
                  <p className="text-xs text-muted-foreground truncate">/{service.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {service.description}
              </p>

              {/* Actions */}
              <div className="flex gap-1 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleVisibility(service.id, service.is_active)}
                  className="flex-1"
                  title={service.is_active ? 'Ocultar' : 'Mostrar'}
                >
                  {service.is_active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDuplicate(service)}
                  className="flex-1"
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <p>🔗 CTA: {service.cta_text}</p>
                <p>📅 {new Date(service.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Sheet */}
      {editingService && (
        <ServiceEditSheet
          service={editingService}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onClose={() => {
            setIsSheetOpen(false)
            setEditingId(null)
          }}
        />
      )}
    </>
  )
}
