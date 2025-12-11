'use client'

import { useState, useRef } from 'react'
import { HeroImage } from '@/services/heroImages.service'
import { useUpdateHeroImage, useCreateHeroImage } from '@/hooks/useHeroImages'
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
import { toast } from 'sonner'

interface HeroImageEditSheetProps {
  image: HeroImage
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function HeroImageEditSheet({
  image,
  isOpen,
  onOpenChange,
  onClose,
}: HeroImageEditSheetProps) {
  const [title, setTitle] = useState(image.title || '')
  const [alt, setAlt] = useState(image.alt || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateImage = useUpdateHeroImage()
  const createImage = useCreateHeroImage()

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

      await updateImage.mutateAsync({
        id: image.id,
        payload: {
          url: result.url,
          thumbnail_url: result.url.replace('/upload/', '/upload/w_400,q_80/'),
          width: result.width,
          height: result.height,
        },
      })

      toast.success('Imagen reemplazada', {
        description: 'La imagen se actualizó correctamente',
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen'
      setUploadError(errorMessage)
      toast.error('Error al subir imagen', {
        description: errorMessage,
      })
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
      toast.success('Imagen actualizada', {
        description: 'Los cambios se guardaron correctamente',
      })
      onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
      toast.error('Error al actualizar', {
        description: error instanceof Error ? error.message : 'No se pudieron guardar los cambios',
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl">Editar Imagen del Hero</SheetTitle>
            <SheetDescription>
              Actualiza los detalles de la imagen
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Vista Previa</Label>
            <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50">
              <img
                src={image.thumbnail_url || image.url}
                alt={image.alt || 'Hero image'}
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
                    Seleccionar Imagen
                  </>
                )}
              </Button>
            </div>
            {uploadError && (
              <p className="text-xs text-red-500">
                {uploadError}
              </p>
            )}
            <p className="text-xs text-slate-500">
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
              Texto Alternativo (SEO)
            </Label>
            <Input
              id="alt"
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder="Descripción para accesibilidad"
            />
            <p className="text-xs text-slate-500">
              Describe brevemente la imagen para SEO y accesibilidad
            </p>
          </div>

          {/* Order */}
          <div className="space-y-2 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <p>Dimensiones: {image.width}x{image.height}px</p>
            <p>Subida: {new Date(image.uploaded_at).toLocaleDateString()}</p>
            <p>Actualizada: {new Date(image.updated_at).toLocaleDateString()}</p>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-6 px-6 py-4 flex gap-3">
            <Button
              type="submit"
              onClick={handleSave}
              disabled={updateImage.isPending}
              className="flex-1 h-11"
            >
              {updateImage.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
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
