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
}

export function HeroImagesGrid({ images }: HeroImagesGridProps) {
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
            draggable
            onDragStart={() => handleDragStart(image.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(image.id)}
            className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-move ${
              draggedId === image.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 opacity-50'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            {/* Imagen */}
            <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={image.thumbnail_url || image.url}
                alt={image.alt || 'Hero image'}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(image.id)
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
                  <p className="text-sm font-medium truncate">{image.title || 'Sin título'}</p>
                  <p className="text-xs text-muted-foreground truncate">{image.alt || 'Sin descripción'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleVisibility(image.id, image.is_visible)}
                  className="flex-1"
                >
                  {image.is_visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(image.id, image.title || 'imagen')}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                <p>📐 {image.width}x{image.height}px</p>
                <p>📅 {new Date(image.uploaded_at).toLocaleDateString()}</p>
              </div>
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
