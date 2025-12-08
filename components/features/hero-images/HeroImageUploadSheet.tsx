'use client'

import { useState, useRef, useEffect } from 'react'
import { useCreateHeroImage, useHeroImages } from '@/hooks/useHeroImages'
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

interface HeroImageUploadSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function HeroImageUploadSheet({
  isOpen,
  onOpenChange,
}: HeroImageUploadSheetProps) {
  const { data: images = [] } = useHeroImages()
  const createImage = useCreateHeroImage()

  const [title, setTitle] = useState('')
  const [alt, setAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = getImageValidationError(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setUploadError(null)
    setPreviewUrl(URL.createObjectURL(file))
    setTitle(file.name.replace(/\.[^/.]+$/, ''))
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return

    const file = fileInputRef.current.files[0]
    setIsUploading(true)

    try {
      const result = await uploadToCloudinary(file, 'hero')
      const nextOrder = images.length > 0 ? Math.max(...images.map(img => img.order)) + 1 : 0

      await createImage.mutateAsync({
        url: result.url,
        thumbnail_url: result.url.replace('/upload/', '/upload/w_400,q_80/'),
        title: title || file.name.replace(/\.[^/.]+$/, ''),
        alt: alt || file.name.replace(/\.[^/.]+$/, ''),
        width: result.width,
        height: result.height,
        order: nextOrder,
        is_visible: true,
      })

      toast.success('Imagen agregada', {
        description: 'La imagen del Hero se agregó correctamente',
      })

      // Reset
      setTitle('')
      setAlt('')
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl">Agregar Imagen al Hero</SheetTitle>
            <SheetDescription>
              Sube una nueva imagen para el carousel del hero
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* File Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Seleccionar Imagen</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !!previewUrl}
              className="w-full gap-2 h-11"
            >
              <Upload className="w-4 h-4" />
              Seleccionar Imagen
            </Button>
            <p className="text-xs text-slate-500">
              Formatos: JPEG, PNG, WebP, GIF • Máximo: 5MB
            </p>
            {uploadError && (
              <p className="text-xs text-red-500">
                {uploadError}
              </p>
            )}
          </div>

          {/* Preview */}
          {previewUrl && (
            <>
              <div className="space-y-2 border-t pt-6">
                <Label className="text-sm font-medium">Vista Previa</Label>
                <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2">
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
            </>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-6 px-6 py-4 flex gap-3">
            {previewUrl ? (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 h-11"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Subiendo...
                    </span>
                  ) : (
                    'Subir Imagen'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTitle('')
                    setAlt('')
                    setPreviewUrl(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  disabled={isUploading}
                  className="h-11"
                >
                  Cambiar
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full h-11"
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
