'use client'

import { useState, useRef } from 'react'
import { Service } from '@/services/services.service'
import { useUpdateService } from '@/hooks/useServices'
import { getImageValidationError, uploadToCloudinary } from '@/lib/cloudinary'
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
import { ServiceGalleryManager } from './ServiceGalleryManager'
import { toast } from 'sonner'

interface ServiceEditSheetProps {
  service: Service
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function ServiceEditSheet({
  service,
  isOpen,
  onOpenChange,
  onClose,
}: ServiceEditSheetProps) {
  const [title, setTitle] = useState(service.title)
  const [slug, setSlug] = useState(service.slug)
  const [description, setDescription] = useState(service.description)
  const [ctaText, setCtaText] = useState(service.cta_text)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateService = useUpdateService()

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
      const result = await uploadToCloudinary(file, 'services')

      await updateService.mutateAsync({
        id: service.id,
        payload: {
          image: result.url,
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
    // Validar campos requeridos
    if (!title || title.length < 3 || title.length > 200) {
      toast.error('Error de validación', {
        description: 'El título debe tener entre 3 y 200 caracteres',
      })
      return
    }

    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.startsWith('-') || slug.endsWith('-')) {
      toast.error('Error de validación', {
        description: 'El slug debe ser válido (solo letras minúsculas, números y guiones)',
      })
      return
    }

    if (!description || description.length < 20 || description.length > 2000) {
      toast.error('Error de validación', {
        description: 'La descripción debe tener entre 20 y 2000 caracteres',
      })
      return
    }

    try {
      await updateService.mutateAsync({
        id: service.id,
        payload: {
          title: title || undefined,
          slug: slug || undefined,
          description: description || undefined,
          cta_text: ctaText || undefined,
        },
      })
      toast.success('¡Servicio actualizado!', {
        description: 'Los cambios se guardaron correctamente',
      })
      onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
      toast.error('Error al guardar', {
        description: 'No se pudieron guardar los cambios. Intenta nuevamente.',
      })
    }
  }

  // Función para verificar si hay errores de validación
  const hasValidationErrors = () => {
    if (!title || title.length < 3 || title.length > 200) return true
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.startsWith('-') || slug.endsWith('-')) return true
    if (!description || description.length < 20 || description.length > 2000) return true
    return false
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl">Editar Servicio</SheetTitle>
            <SheetDescription>
              Actualiza los detalles del servicio
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Vista Previa</Label>
            <div className="relative aspect-video overflow-hidden rounded-lg border-2 bg-slate-100 dark:bg-slate-800">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                  <span className="text-slate-400">Sin imagen</span>
                </div>
              )}
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
              <p className="text-xs text-red-500 flex items-center gap-1">
                {uploadError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos: JPEG, PNG, WebP, GIF • Máximo: 5MB
            </p>
          </div>

          {/* Título */}
          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="title" className="text-sm font-medium">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: BODAS"
            />
            {title && title.length < 3 && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                El título debe tener al menos 3 caracteres
              </p>
            )}
            {title && title.length > 200 && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                El título es demasiado largo (máximo 200 caracteres)
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug (URL) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase())}
              placeholder="Ej: bodas"
              className="font-mono text-sm"
            />
            {slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                Solo letras minúsculas, números y guiones (ejemplo: fotografia-bodas)
              </p>
            )}
            {slug && (slug.startsWith('-') || slug.endsWith('-')) && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                No puede empezar ni terminar con guión
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Identificador único para la URL del servicio
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción <span className="text-red-500">*</span> ({description.length}/2000)
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2.5 border rounded-md resize-y text-sm leading-relaxed focus:ring-2 focus:ring-primary"
              placeholder="Describe el servicio de manera clara y concisa..."
            />
            {description && description.length < 20 && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                La descripción debe tener al menos 20 caracteres
              </p>
            )}
            {description && description.length > 2000 && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                La descripción es demasiado larga (máximo 2000 caracteres)
              </p>
            )}
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

          {/* Galería de Imágenes */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <h3 className="font-semibold text-base mb-1">Galería de Imágenes</h3>
              <p className="text-xs text-muted-foreground">
                Imágenes que se mostrarán en la página individual del servicio
              </p>
            </div>
            <ServiceGalleryManager serviceId={service.id} disabled={updateService.isPending} />
          </div>

          {/* Metadata */}
          <div className="space-y-2 border-t pt-6 text-xs text-muted-foreground">
            <p>Creado: {new Date(service.created_at).toLocaleDateString()}</p>
            <p>Actualizado: {new Date(service.updated_at).toLocaleDateString()}</p>
            <p>Estado: {service.is_active ? 'Visible' : 'Oculto'}</p>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-background border-t -mx-6 px-6 py-4 flex gap-3">
            <Button
              type="submit"
              onClick={handleSave}
              disabled={updateService.isPending || hasValidationErrors()}
              className="flex-1 h-11"
            >
              {updateService.isPending ? (
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
                setTitle(service.title)
                setSlug(service.slug)
                setDescription(service.description)
                setCtaText(service.cta_text)
                onClose()
              }}
              className="h-11"
            >
              Cancelar
            </Button>
          </div>

          {/* Mensaje de validación */}
          {hasValidationErrors() && (
            <div className="text-sm text-amber-600 flex items-center gap-2 -mt-4">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Por favor corrige los errores antes de guardar
            </div>
          )}

          {updateService.isSuccess && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Cambios guardados correctamente
            </div>
          )}

          {updateService.isError && (
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
