'use client'

import { useState, useRef } from 'react'
import { PortfolioImage } from '@/services/portfolio-images.service'
import { useUpdatePortfolioImage } from '@/hooks/usePortfolioImages'
import { uploadToCloudinary, getImageValidationError } from '@/lib/cloudinary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Upload, Loader2 } from 'lucide-react'

interface PortfolioImageEditSheetProps {
  image: PortfolioImage
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function PortfolioImageEditSheet({
  image,
  isOpen,
  onOpenChange,
  onClose,
}: PortfolioImageEditSheetProps) {
  const [title, setTitle] = useState(image.title || '')
  const [alt, setAlt] = useState(image.alt || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateImage = useUpdatePortfolioImage()

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
      const result = await uploadToCloudinary(file, 'gallery')

      await updateImage.mutateAsync({
        id: image.id,
        payload: {
          image_url: result.url,
          thumbnail_url: result.url.replace('/upload/', '/upload/w_400,q_80/'),
        },
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

  const handleSave = async () => {
    try {
      await updateImage.mutateAsync({
        id: image.id,
        payload: {
          title: title || undefined,
          alt: alt || undefined,
        },
      })
      onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl">Editar Imagen</SheetTitle>
            <SheetDescription>
              Actualiza los detalles de la imagen
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Vista Previa</Label>
            <div className="relative aspect-video overflow-hidden rounded-lg border-2 bg-slate-100 dark:bg-slate-800">
              <img
                src={image.thumbnail_url || image.image_url}
                alt={image.alt || 'Imagen del portafolio'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Upload Nueva Imagen */}
          <div className="space-y-2 border-t pt-6">
            <Label className="text-sm font-medium">Cambiar Imagen</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
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
                    Seleccionar Nueva Imagen
                  </>
                )}
              </Button>
            </div>
            {uploadError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {uploadError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos: JPEG, PNG, WebP, GIF • Máximo: 5MB
            </p>
          </div>

          {/* Título */}
          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="title" className="text-sm font-medium">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título de la imagen"
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="alt" className="text-sm font-medium">
              Texto Alternativo (Alt)
            </Label>
            <Input
              id="alt"
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder="Descripción para SEO"
            />
            <p className="text-xs text-muted-foreground">
              Texto que se muestra cuando la imagen no se puede cargar
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2 border-t pt-6 text-xs text-muted-foreground">
            <p>🆔 ID: {image.id}</p>
            <p>📅 Creado: {new Date(image.created_at).toLocaleDateString()}</p>
            <p>🔄 Actualizado: {new Date(image.updated_at).toLocaleDateString()}</p>
            <p>👁️ Estado: {image.is_visible ? 'Visible' : 'Oculto'}</p>
            {image.is_featured && <p>⭐ Imagen destacada</p>}
            {image.service_id && <p>🔗 Vinculada a servicio: {image.service_id}</p>}
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-background border-t -mx-6 px-6 py-4 flex gap-3">
            <Button
              type="submit"
              onClick={handleSave}
              disabled={updateImage.isPending}
              className="flex-1 h-11"
            >
              {updateImage.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                'Guardar Cambios'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTitle(image.title || '')
                setAlt(image.alt || '')
                onClose()
              }}
              className="h-11"
            >
              Cancelar
            </Button>
          </div>

          {updateImage.isSuccess && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Cambios guardados correctamente
            </div>
          )}

          {updateImage.isError && (
            <div className="text-sm text-red-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Error al guardar los cambios
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

