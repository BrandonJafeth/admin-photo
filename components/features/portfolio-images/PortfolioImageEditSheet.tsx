'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PortfolioImage } from '@/services/portfolio-images.service'
import { useUpdatePortfolioImage } from '@/hooks/usePortfolioImages'
import { useServices } from '@/hooks/useServices'
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

const portfolioImageEditSchema = z.object({
  title: z.string().max(200, 'El título es demasiado largo (máx. 200 caracteres)').optional().or(z.literal('')),
  alt: z.string().max(200, 'El texto alternativo es demasiado largo (máx. 200 caracteres)').optional().or(z.literal('')),
})

type PortfolioImageEditFormData = z.infer<typeof portfolioImageEditSchema>

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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateImage = useUpdatePortfolioImage()
  const { data: services = [] } = useServices()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PortfolioImageEditFormData>({
    resolver: zodResolver(portfolioImageEditSchema),
    defaultValues: {
      title: image.title || '',
      alt: image.alt || '',
    },
  })

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

  const normalize = (value?: string | null) =>
  value && value.trim().length > 0 ? value.trim() : null

 const onSubmit = async (data: PortfolioImageEditFormData) => {
  try {
    await updateImage.mutateAsync({
      id: image.id,
      payload: {
        title: normalize(data.title),
        alt: normalize(data.alt),
      },
    })
    toast.success('¡Imagen actualizada!', {
      description: 'Los cambios se guardaron correctamente',
    })
    onClose()
  } catch (error) {
    console.error('Error al guardar:', error)
    toast.error('Error al guardar', {
      description:
        error instanceof Error ? error.message : 'No se pudieron guardar los cambios',
    })
  }
}

  const hasValidationErrors = () => {
    return Object.keys(errors).length > 0
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

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-8">
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
              Título ({watch('title')?.length || 0}/200)
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Título de la imagen"
            />
            {watch('title') && watch('title')!.length > 200 && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                El título es demasiado largo (máximo 200 caracteres)
              </p>
            )}
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="alt" className="text-sm font-medium">
              Texto Alternativo (Alt) ({watch('alt')?.length || 0}/200)
            </Label>
            <Input
              id="alt"
              {...register('alt')}
              placeholder="Descripción para SEO"
            />
            {watch('alt') && watch('alt')!.length > 200 && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                El texto alternativo es demasiado largo (máximo 200 caracteres)
              </p>
            )}
            {errors.alt && (
              <p className="text-xs text-red-500">{errors.alt.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Texto que se muestra cuando la imagen no se puede cargar
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2 border-t pt-6 text-xs text-muted-foreground">
            <p>ID: {image.id}</p>
            <p>Creado: {new Date(image.created_at).toLocaleDateString()}</p>
            <p>Actualizado: {new Date(image.updated_at).toLocaleDateString()}</p>
            <p>Estado: {image.is_visible ? 'Visible' : 'Oculto'}</p>
            {image.is_featured && <p>Imagen destacada</p>}
            {image.service_id && (
              <p>
                Vinculada a servicio: {services.find(s => s.id === image.service_id)?.title || image.service_id}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-background border-t -mx-6 px-6 py-4 flex gap-3">
            <Button
              type="submit"
              disabled={updateImage.isPending || hasValidationErrors()}
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
                reset()
                onClose()
              }}
              disabled={updateImage.isPending}
              className="h-11"
            >
              Cancelar
            </Button>
          </div>

          {hasValidationErrors() && (
            <div className="text-sm text-amber-600 flex items-center gap-2 -mt-4">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Por favor corrige los errores antes de guardar
            </div>
          )}

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
        </form>
      </SheetContent>
    </Sheet>
  )
}

