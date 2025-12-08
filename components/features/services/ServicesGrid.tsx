'use client'

import { useState } from 'react'
import { Service } from '@/services/services.service'
import { useDeleteService, useUpdateService, useUpdateServicesOrder } from '@/hooks/useServices'
import { Button } from '@/components/ui/button'
import { Trash2, Eye, EyeOff, GripVertical, Pencil } from 'lucide-react'
import { ServiceEditSheet } from './ServiceEditSheet'
import { toast } from 'sonner'


interface ServicesGridProps {
  services: Service[]
  isReordering: boolean
}

export function ServicesGrid({ services, isReordering }: ServicesGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const deleteService = useDeleteService()
  const updateService = useUpdateService()
  const updateOrder = useUpdateServicesOrder()

  const editingService = services.find(svc => svc.id === editingId)

  const handleDragStart = (id: string) => {
    if (!isReordering) return
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!isReordering) return
    e.preventDefault()
  }

  const handleDrop = async (targetId: string) => {
    if (!isReordering || !draggedId || draggedId === targetId) return

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
      toast.success('Orden actualizado', {
        description: 'El orden de los servicios se actualizó correctamente',
      })
    } catch (error) {
      console.error('Error al actualizar orden:', error)
      toast.error('Error al reordenar', {
        description: 'No se pudo actualizar el orden. Intenta nuevamente.',
      })
    }

    setDraggedId(null)
  }

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await updateService.mutateAsync({
        id,
        payload: { is_active: !isVisible },
      })
      toast.success(isVisible ? 'Servicio ocultado' : 'Servicio visible', {
        description: `El servicio ahora está ${isVisible ? 'oculto' : 'visible'}`,
      })
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error)
      toast.error('Error al cambiar visibilidad', {
        description: 'No se pudo actualizar la visibilidad. Intenta nuevamente.',
      })
    }
  }

  const handleDelete = async (id: string, title: string) => {
    toast.warning('¿Eliminar servicio?', {
      description: `Estás a punto de eliminar "${title}". Esta acción no se puede deshacer.`,
      action: {
        label: 'Eliminar',
        onClick: async () => {
          // Mostrar toast de loading
          const loadingToast = toast.loading('Eliminando servicio...', {
            description: 'Por favor espera',
          })

          try {
            await deleteService.mutateAsync(id)
            toast.dismiss(loadingToast)
            toast.success('Servicio eliminado', {
              description: 'El servicio se eliminó correctamente',
            })
          } catch (error) {
            console.error('Error al eliminar:', error)
            toast.dismiss(loadingToast)
            toast.error('Error al eliminar', {
              description: 'No se pudo eliminar el servicio. Intenta nuevamente.',
            })
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => { },
      },
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, index) => (
          <div
            key={service.id}
            draggable={isReordering}
            onDragStart={() => handleDragStart(service.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(service.id)}
            className={`relative group rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all ${isReordering ? 'cursor-move' : 'cursor-default'} ${draggedId === service.id
              ? 'ring-2 ring-blue-500 scale-95 opacity-50'
              : 'hover:scale-[1.02]'
              }`}
          >
            {/* Imagen */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
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

              {/* Badge de Estado - Arriba derecha */}
              {!isReordering && (
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${service.is_active
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-400 text-white'
                    }`}>
                    {service.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}

              {/* Drag Handle - Solo visible en modo reordering */}
              {isReordering && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white p-2 rounded cursor-move shadow-lg">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{service.title}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">/{service.slug}</p>
                </div>
                {isReordering && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                {service.description}
              </p>

              {/* Actions */}
              {!isReordering && (
                <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVisibility(service.id, service.is_active)}
                    className="flex-1 gap-1.5 text-xs"
                    title={service.is_active ? 'Ocultar' : 'Mostrar'}
                  >
                    {service.is_active ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(service.id)
                      setIsSheetOpen(true)
                    }}
                    className="flex-1 gap-1.5 text-xs"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(service.id, service.title)}
                    className="flex-1 gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

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
