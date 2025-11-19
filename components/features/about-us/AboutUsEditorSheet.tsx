'use client'

import { useState, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
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
import { AboutUsFormData } from '@/lib/validations/aboutUs'
import { uploadToCloudinary, getImageValidationError } from '@/lib/cloudinary'
import { Upload, Loader2 } from 'lucide-react'
import { watch } from 'fs/promises'

interface AboutUsEditorSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  form: UseFormReturn<AboutUsFormData>
  onSubmit: (data: AboutUsFormData) => Promise<void>
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  previewImageUrl?: string
  previewImageAlt?: string
}

export function AboutUsEditorSheet({
  isOpen,
  onOpenChange,
  form,
  onSubmit,
  isSubmitting,
  isSuccess,
  isError,
  previewImageUrl,
  previewImageAlt,
}: AboutUsEditorSheetProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = form

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar archivo
    const validationError = getImageValidationError(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    setUploadError(null)

    try {
      setValue('image_url', URL.createObjectURL(file))
      setValue('image_alt', file.name.replace(/\.[^/.]+$/, ''))
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Error al procesar la imagen'
      )
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl">Editar About Us</SheetTitle>
            <SheetDescription>
              Los cambios se reflejan en tiempo real en la vista previa
            </SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-8">
          {/* Contenido */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Título de la sección *
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ej: Sobre Nosotros"
                className="text-base"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Descripción * ({watch('description')?.length || 0}/2000)
              </Label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full min-h-[180px] px-3 py-2.5 border rounded-md resize-y text-sm leading-relaxed focus:ring-2 focus:ring-primary"
                placeholder="Cuéntanos sobre tu negocio, tu historia, tus valores..."
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.description.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                💡 Usa saltos de línea para separar párrafos
              </p>
            </div>
          </div>

          {/* Imagen */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Imagen de la sección</h3>
              {previewImageUrl && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Imagen cargada
                </span>
              )}
            </div>
            
            {previewImageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2">
                <img
                  src={previewImageUrl}
                  alt={previewImageAlt || 'Preview'}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* Upload Button */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Subir Nueva Imagen</Label>
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
                  <span>⚠</span> {uploadError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Formatos: JPEG, PNG, WebP, GIF • Máximo: 5MB
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium">
                URL de la Imagen
              </Label>
              <Input
                id="image_url"
                {...register('image_url')}
                placeholder="https://res.cloudinary.com/..."
                className="font-mono text-xs"
              />
              {errors.image_url && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.image_url.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                📸 O pega la URL de la imagen aquí manualmente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_alt" className="text-sm font-medium">
                Texto Alternativo (SEO)
              </Label>
              <Input
                id="image_alt"
                {...register('image_alt')}
                placeholder="Ej: Equipo de trabajo en el estudio"
              />
              {errors.image_alt && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.image_alt.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Describe brevemente la imagen para accesibilidad
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-background border-t -mx-6 px-6 py-4 flex gap-3">
            <Button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="flex-1 h-11"
            >
              {isSubmitting ? (
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
                onOpenChange(false)
              }}
              className="h-11"
            >
              Cancelar
            </Button>
          </div>

          {isSuccess && (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Cambios guardados correctamente
            </div>
          )}

          {isError && (
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
