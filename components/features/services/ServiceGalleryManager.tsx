'use client'

import { useState, useRef } from 'react'
import { GripVertical, Upload, X, Loader2, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePortfolioImagesByServiceId } from '@/hooks/usePortfolioImages'
import { useCreateManyPortfolioImages, useDeletePortfolioImage, useUpdatePortfolioImagesOrder } from '@/hooks/usePortfolioImages'
import { uploadToCloudinary, getImageValidationError } from '@/lib/cloudinary'
import { toast } from 'sonner'

interface ServiceGalleryManagerProps {
  serviceId: string
  disabled?: boolean
}

export function ServiceGalleryManager({ serviceId, disabled = false }: ServiceGalleryManagerProps) {
  const { data: images = [], isLoading } = usePortfolioImagesByServiceId(serviceId)
  const createManyImages = useCreateManyPortfolioImages()
  const deleteImage = useDeletePortfolioImage()
  const updateOrder = useUpdatePortfolioImagesOrder()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validar todas las imágenes
    const validationErrors = files
      .map(file => getImageValidationError(file))
      .filter(Boolean) as string[]

    if (validationErrors.length > 0) {
      setUploadError(validationErrors[0])
      return
    }

    setUploadError(null)
    setIsUploading(true)

    try {
      // Subir todas las imágenes a Cloudinary
      const uploadPromises = files.map(async (file) => {
        const result = await uploadToCloudinary(file, 'services/gallery')
        return {
          image_url: result.url,
          thumbnail_url: result.url.replace('/upload/', '/upload/w_400,q_80/'),
          title: file.name.replace(/\.[^/.]+$/, ''),
          alt: file.name.replace(/\.[^/.]+$/, ''),
          service_id: serviceId,
          is_visible: true,
        }
      })

      const imagesData = await Promise.all(uploadPromises)

      // Guardar en la base de datos
      await createManyImages.mutateAsync(imagesData)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Error al subir las imágenes'
      )
    } finally {
      setIsUploading(false)
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
            console.error('Error al eliminar imagen:', error)
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

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const draggedIndex = images.findIndex(img => img.id === draggedId)
    const targetIndex = images.findIndex(img => img.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null)
      return
    }

    const newImages = [...images]
    const [removed] = newImages.splice(draggedIndex, 1)
    newImages.splice(targetIndex, 0, removed)

    // Actualizar orden en la base de datos
    const orderUpdates = newImages.map((img, index) => ({
      id: img.id,
      order: index,
    }))

    try {
      await updateOrder.mutateAsync(orderUpdates)
    } catch (error) {
      console.error('Error al actualizar orden:', error)
    } finally {
      setDraggedId(null)
    }
  }

  const handleFileDialogOpen = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card className="p-4 border-dashed border-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Galería de Imágenes</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Imágenes que se mostrarán en la página del servicio ({images.length} {images.length === 1 ? 'imagen' : 'imágenes'})
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFileDialogOpen}
              disabled={disabled || isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <ImagePlus className="w-4 h-4" />
                  Agregar Imágenes
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {uploadError && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">
              ⚠ {uploadError}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Soporta JPG, PNG, WebP (máx. 5MB cada una). Puedes subir múltiples imágenes a la vez.
          </div>
        </div>
      </Card>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card
              key={image.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(image.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(image.id)}
              className={`relative group aspect-square overflow-hidden cursor-move hover:ring-2 hover:ring-primary transition-all ${
                draggedId === image.id ? 'opacity-50 ring-2 ring-primary' : ''
              } ${disabled ? 'cursor-not-allowed' : ''}`}
            >
              <div className="absolute top-2 left-2  bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <GripVertical className="w-3 h-3" />
                <span>#{image.order + 1}</span>
              </div>

              <img
                src={image.thumbnail_url || image.image_url}
                alt={image.alt || image.title || 'Imagen del servicio'}
                className="w-full h-full object-cover"
              />

              {image.is_featured && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  ⭐
                </div>
              )}

              {!image.is_visible && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Oculta</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(image.id)}
                  disabled={disabled || deleteImage.isPending}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed">
          <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            No hay imágenes en la galería. Agrega imágenes para mostrarlas en la página del servicio.
          </p>
        </Card>
      )}

      {/* Info */}
      {images.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <span>
            💡 Arrastra las imágenes para reordenarlas
          </span>
        </div>
      )}
    </div>
  )
}

