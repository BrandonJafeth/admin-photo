'use client'

import { useState, useRef } from 'react'
import { useCreateService, useServices } from '@/hooks/useServices'
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

interface ServiceCreateSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ServiceCreateSheet({
  isOpen,
  onOpenChange,
}: ServiceCreateSheetProps) {
  const { data: services = [] } = useServices()
  const createService = useCreateService()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [ctaText, setCtaText] = useState('SOLICITAR →')
  const [ctaLink, setCtaLink] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
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
  }

  const handleUploadImage = async () => {
    if (!fileInputRef.current?.files?.[0]) return

    const file = fileInputRef.current.files[0]
    setIsUploading(true)

    try {
      const result = await uploadToCloudinary(file, 'services')
      setImageUrl(result.url)
      setPreviewUrl(null)
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

  const handleCreate = async () => {
    if (!title || !slug || !description) {
      alert('Por favor completa los campos requeridos')
      return
    }

    try {
      const nextOrder = services.length > 0 ? Math.max(...services.map(s => s.order)) + 1 : 0

      await createService.mutateAsync({
        title,
        slug,
        description,
        cta_text: ctaText,
        cta_link: ctaLink || undefined,
        image: imageUrl || '', // Enviar string vacío en lugar de undefined
        order: nextOrder,
        is_active: true,
      })

      // Reset
      setTitle('')
      setSlug('')
      setDescription('')
      setCtaText('SOLICITAR →')
      setCtaLink('')
      setImageUrl(null)
      setPreviewUrl(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Error al crear servicio:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl">Crear Nuevo Servicio</SheetTitle>
            <SheetDescription>
              Agrega un nuevo servicio a tu portafolio
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Preview */}
          {previewUrl || imageUrl ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Vista Previa</Label>
              <div className="relative aspect-video overflow-hidden rounded-lg border-2 bg-slate-100 dark:bg-slate-800">
                <img
                  src={previewUrl || imageUrl || ''}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : null}

          {/* Upload Imagen */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Imagen del Servicio</Label>
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
              disabled={isUploading || !!imageUrl}
              className="w-full gap-2 h-11"
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
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {uploadError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos: JPEG, PNG, WebP, GIF • Máximo: 5MB
            </p>
          </div>

          {/* Upload Button (si hay preview) */}
          {previewUrl && !imageUrl && (
            <Button
              onClick={handleUploadImage}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Subiendo...' : 'Subir Imagen'}
            </Button>
          )}

          {/* Título */}
          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="title" className="text-sm font-medium">
              Título *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: BODAS"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug (URL) *
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="Ej: bodas"
            />
            <p className="text-xs text-muted-foreground">
              Identificador único para la URL del servicio
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción *
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2.5 border rounded-md resize-y text-sm leading-relaxed focus:ring-2 focus:ring-primary"
              placeholder="Describe el servicio..."
            />
          </div>

          {/* CTA Text */}
          <div className="space-y-2">
            <Label htmlFor="ctaText" className="text-sm font-medium">
              Texto del Botón CTA
            </Label>
            <Input
              id="ctaText"
              value={ctaText}
              onChange={e => setCtaText(e.target.value)}
              placeholder="Ej: SOLICITAR →"
            />
          </div>

          {/* CTA Link */}
          <div className="space-y-2">
            <Label htmlFor="ctaLink" className="text-sm font-medium">
              Enlace del Botón CTA
            </Label>
            <Input
              id="ctaLink"
              value={ctaLink}
              onChange={e => setCtaLink(e.target.value)}
              placeholder="Ej: /contacto"
            />
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-background border-t -mx-6 px-6 py-4 flex gap-3">
            <Button
              onClick={handleCreate}
              disabled={createService.isPending || !title || !slug || !description}
              className="flex-1 h-11"
            >
              {createService.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </span>
              ) : (
                'Crear Servicio'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTitle('')
                setSlug('')
                setDescription('')
                setCtaText('SOLICITAR →')
                setCtaLink('')
                setImageUrl(null)
                setPreviewUrl(null)
                onOpenChange(false)
              }}
              className="h-11"
            >
              Cancelar
            </Button>
          </div>

          {createService.isSuccess && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Servicio creado correctamente
            </div>
          )}

          {createService.isError && (
            <div className="text-sm text-red-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Error al crear el servicio
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
