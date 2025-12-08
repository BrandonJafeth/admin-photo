'use client'

import { useState } from 'react'
import { HeroImage } from '@/services/heroImages.service'
import { useDeleteHeroImage, useUpdateHeroImage, useUpdateHeroImagesOrder } from '@/hooks/useHeroImages'
import { Button } from '@/components/ui/button'
import { Trash2, Eye, EyeOff, GripVertical, Pencil } from 'lucide-react'
import { HeroImageEditSheet } from './HeroImageEditSheet'
import { toast } from 'sonner'


interface HeroImagesGridProps {
  images: HeroImage[]
  isReordering: boolean
}

export function HeroImagesGrid({ images, isReordering }: HeroImagesGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const deleteImage = useDeleteHeroImage()
  const updateImage = useUpdateHeroImage()
  const updateOrder = useUpdateHeroImagesOrder()

  const editingImage = images.find(img => img.id === editingId)

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    const draggedIndex = images.findIndex(img => img.id === draggedId)
    const targetIndex = images.findIndex(img => img.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newImages = [...images]
    const [draggedImage] = newImages.splice(draggedIndex, 1)
    newImages.splice(targetIndex, 0, draggedImage)

    const updates = newImages.map((img, index) => ({
      id: img.id,
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
      await updateImage.mutateAsync({
        id,
        payload: { is_visible: !isVisible },
      })
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    toast.warning('¿Eliminar imagen?', {
      description: `Estás a punto de eliminar "${title || 'esta imagen'}". Esta acción no se puede deshacer.`,
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            await deleteImage.mutateAsync(id)
            toast.success('Imagen eliminada', {
              description: 'La imagen se eliminó correctamente',
            })
          } catch (error) {
            console.error('Error al eliminar:', error)
            toast.error('Error al eliminar', {
              description: 'No se pudo eliminar la imagen. Intenta nuevamente.',
            })
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable={isReordering}
            onDragStart={isReordering ? () => handleDragStart(image.id) : undefined}
            onDragOver={isReordering ? handleDragOver : undefined}
            onDrop={isReordering ? () => handleDrop(image.id) : undefined}
            className={`relative group rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all ${
              isReordering ? 'cursor-move' : ''
            } ${
              draggedId === image.id
                ? 'ring-2 ring-blue-500 scale-95 opacity-50'
                : 'hover:scale-[1.02]'
            }`}
          >
            {/* Imagen */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={image.thumbnail_url || image.url}
                alt={image.alt || 'Hero image'}
                className="w-full h-full object-cover"
              />

              {/* Badge de Estado - Arriba derecha */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  image.is_visible
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-400 text-white'
                }`}>
                  {image.is_visible ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{image.title || 'Sin título'}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">{image.alt || 'Sin descripción'}</p>
                </div>
              </div>

              {/* Actions */}
              {!isReordering && (
                <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(image.id)
                      setIsSheetOpen(true)
                    }}
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(image.id, image.title || 'imagen')}
                    className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200"
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
      {editingImage && (
        <HeroImageEditSheet
          image={editingImage}
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
