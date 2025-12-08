'use client'

import { useState, useRef } from 'react'
import { 
  usePortfolioImages, 
  useDeletePortfolioImage, 
  useUpdatePortfolioImagesOrder, 
  useUpdatePortfolioImage 
} from '@/hooks/usePortfolioImages'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, Eye, EyeOff, GripVertical, Pencil, ArrowDownUp, X } from 'lucide-react'
import { PortfolioImageEditSheet } from './portfolio-images/PortfolioImageEditSheet'
import { PortfolioImageUploadSheet } from './portfolio-images/PortfolioImageUploadSheet'
import { toast } from 'sonner'

export default function PortfolioImagesManager() {
  const { data: images = [], isLoading } = usePortfolioImages()
  const deleteImage = useDeletePortfolioImage()
  const updateImage = useUpdatePortfolioImage()
  const updateOrder = useUpdatePortfolioImagesOrder()

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.order)) + 1 : 0

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

    const draggedIndex = images.findIndex(img => img.id === draggedId)
    const targetIndex = images.findIndex(img => img.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Crear nuevo array con orden actualizado
    const newImages = [...images]
    const [draggedImage] = newImages.splice(draggedIndex, 1)
    newImages.splice(targetIndex, 0, draggedImage)

    // Actualizar orden
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

  const handleDelete = async (id: string) => {
    toast.warning('¿Eliminar imagen?', {
      description: 'Esta acción no se puede deshacer.',
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

  const editingImage = images.find(img => img.id === editingId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Subir Nueva Imagen</h3>
            <p className="text-sm text-muted-foreground">
              Completa los detalles y sube la imagen en un solo paso
            </p>
          </div>
          <Button
            onClick={() => setIsUploadSheetOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white"
          >
            <Upload className="w-4 h-4" />
            Nueva Imagen
          </Button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">Galería de Imágenes ({images.length})</h3>
            {isReordering && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <ArrowDownUp className="w-3 h-3" />
                Modo reordenamiento
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isReordering ? "default" : "outline"}
              size="sm"
              onClick={() => setIsReordering(!isReordering)}
              className={isReordering ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {isReordering ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Terminar
                </>
              ) : (
                <>
                  <ArrowDownUp className="w-4 h-4 mr-1" />
                  Reordenar
                </>
              )}
            </Button>
          </div>
        </div>

        {images.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay imágenes en la galería. Sube una para comenzar.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable={isReordering}
                onDragStart={() => handleDragStart(image.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(image.id)}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${isReordering ? 'cursor-move' : 'cursor-default'} ${
                  draggedId === image.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 opacity-50'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                {/* Imagen */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={image.thumbnail_url || image.image_url}
                    alt={image.alt || 'Imagen del portafolio'}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  {!isReordering && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(image.id)
                          setIsEditSheetOpen(true)
                        }}
                        className="gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </Button>
                    </div>
                  )}

                  {/* Drag Handle - Solo visible en modo reordering */}
                  {isReordering && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white p-2 rounded cursor-move shadow-lg">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  )}

                  {image.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      Destacada
                    </div>
                  )}

                  {!image.is_visible && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Oculta</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-2 bg-white dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{image.title || 'Sin título'}</p>
                      <p className="text-xs text-muted-foreground truncate">{image.alt || 'Sin descripción'}</p>
                    </div>
                    {isReordering && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isReordering && (
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
                        onClick={() => handleDelete(image.id)}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <p>Creada: {new Date(image.created_at).toLocaleDateString()}</p>
                    {image.service_id && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">Vinculada a servicio</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Sheet */}
      <PortfolioImageUploadSheet
        isOpen={isUploadSheetOpen}
        onOpenChange={setIsUploadSheetOpen}
        onClose={() => setIsUploadSheetOpen(false)}
        nextOrder={nextOrder}
      />

      {/* Edit Sheet */}
      {editingImage && (
        <PortfolioImageEditSheet
          image={editingImage}
          isOpen={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          onClose={() => {
            setIsEditSheetOpen(false)
            setEditingId(null)
          }}
        />
      )}
    </div>
  )
}

