'use client'

import { useState, useRef } from 'react'
import { useHeroImages, useCreateHeroImage, useDeleteHeroImage, useUpdateHeroImagesOrder, useUpdateHeroImage } from '@/hooks/useHeroImages'
import { uploadToCloudinary, getImageValidationError } from '@/lib/cloudinary'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, Eye, EyeOff, GripVertical, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function HeroImagesManager() {
  const { data: images = [], isLoading } = useHeroImages()
  const createImage = useCreateHeroImage()
  const deleteImage = useDeleteHeroImage()
  const updateImage = useUpdateHeroImage()
  const updateOrder = useUpdateHeroImagesOrder()

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', alt: '' })
  const [showEditModal, setShowEditModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = getImageValidationError(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setUploadError(null)
    setIsUploading(true)

    try {
      const result = await uploadToCloudinary(file, 'hero')
      const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.order)) + 1 : 0

      await createImage.mutateAsync({
        url: result.url,
        thumbnail_url: result.url.replace('/upload/', '/upload/w_400,q_80/'),
        title: file.name.replace(/\.[^/.]+$/, ''),
        alt: file.name.replace(/\.[^/.]+$/, ''),
        width: result.width,
        height: result.height,
        order: nextOrder,
        is_visible: true,
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Error al subir la imagen'
      )
    } finally {
      setIsUploading(false)
    }
  }

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

  const handleSaveEdit = async (id: string) => {
    try {
      await updateImage.mutateAsync({
        id,
        payload: {
          title: editForm.title,
          alt: editForm.alt,
        },
      })
      setEditingId(null)
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

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
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Subir Nueva Imagen</h3>
            <p className="text-sm text-muted-foreground">
              Formatos: JPEG, PNG, WebP, GIF • Máximo: 5MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Seleccionar Imagen
              </>
            )}
          </Button>

          {uploadError && (
            <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span>⚠</span> {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Images Grid */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Imágenes del Hero ({images.length})</h3>

        {images.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay imágenes del hero. Sube una para comenzar.</p>
          </Card>
        ) : (
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
                        setEditForm({ title: image.title || '', alt: image.alt || '' })
                        setShowEditModal(true)
                      }}
                    >
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
                      onClick={() => handleDelete(image.id)}
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
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Editar Imagen</h3>
              <p className="text-sm text-muted-foreground">Actualiza los detalles de la imagen</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Título de la imagen"
                />
              </div>
              <div>
                <Label htmlFor="edit-alt">Texto Alternativo (Alt)</Label>
                <Input
                  id="edit-alt"
                  value={editForm.alt}
                  onChange={e => setEditForm({ ...editForm, alt: e.target.value })}
                  placeholder="Descripción para SEO"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  handleSaveEdit(editingId)
                  setShowEditModal(false)
                }}
              >
                Guardar Cambios
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
