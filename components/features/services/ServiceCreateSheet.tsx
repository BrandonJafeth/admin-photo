'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateService, useServices } from '@/hooks/useServices'
import { createServiceSchema, type CreateServiceFormData } from '@/lib/validations/services'
import { uploadToCloudinary, getImageValidationError } from '@/lib/cloudinary'
import { toast } from 'sonner'
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
  const [ctaText, setCtaText] = useState('Ver más')
  const [ctaLink, setCtaLink] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = getImageValidationError(file)
    if (validationError) {
      setUploadError(validationError)
      setSelectedFile(null)
      setPreviewUrl(null)
      return
    }

    setUploadError(null)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // Función para verificar si hay errores de validación
  const hasValidationErrors = () => {
    if (!title || title.length < 3 || title.length > 200) return true
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.startsWith('-') || slug.endsWith('-')) return true
    if (!description || description.length < 20 || description.length > 2000) return true
    if (!selectedFile) return true // Imagen requerida
    return false
  }

  const handleCreate = async () => {
    // Validar antes de intentar crear
    if (hasValidationErrors()) {
      return // No hacer nada, las validaciones visuales ya están mostrando el error
    }

    // Mostrar toast de loading
    const loadingToast = toast.loading('Creando servicio...', {
      description: selectedFile ? 'Subiendo imagen y guardando...' : 'Guardando...',
    })

    try {
      const nextOrder = services.length > 0 ? Math.max(...services.map(s => s.order)) + 1 : 0

      let uploadedImageUrl = ''

      // Subir la imagen solo si hay un archivo seleccionado
      if (selectedFile) {
        try {
          const result = await uploadToCloudinary(selectedFile, 'services')
          uploadedImageUrl = result.url
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen'
          setUploadError(errorMessage)
          toast.dismiss(loadingToast)
          toast.error('Error al subir imagen', {
            description: errorMessage,
          })
          return // No crear el servicio si falla la subida de imagen
        }
      }

      await createService.mutateAsync({
        title,
        slug,
        description,
        cta_text: ctaText,
        cta_link: undefined,
        image: uploadedImageUrl,
        order: nextOrder,
        is_active: true,
      })

      toast.dismiss(loadingToast)
      toast.success('¡Servicio creado!', {
        description: `El servicio "${title}" se creó correctamente`,
      })

      // Reset
      setTitle('')
      setSlug('')
      setDescription('')
      setCtaText('Ver más ')
      setSelectedFile(null)
      setPreviewUrl(null)
      setUploadError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error al crear servicio:', error)
      toast.dismiss(loadingToast)
      
      // Extraer mensaje de error específico
      let errorMessage = 'No se pudo crear el servicio. Intenta nuevamente.'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Manejar errores de Supabase o base de datos
        const dbError = error as any
        
        if (dbError.code === '23505') {
          // Error de unique constraint
          if (dbError.message?.includes('services_slug_key')) {
            errorMessage = `El slug "${slug}" ya está en uso. Por favor elige otro.`
          } else if (dbError.message?.includes('services_title_key')) {
            errorMessage = `Ya existe un servicio con el título "${title}".`
          } else {
            errorMessage = 'Ya existe un servicio con estos datos. Verifica el título o slug.'
          }
        } else if (dbError.message) {
          errorMessage = dbError.message
        } else if (dbError.error) {
          errorMessage = dbError.error
        }
      }
      
      toast.error('Error al crear servicio', {
        description: errorMessage,
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl">Crear Nuevo Servicio</SheetTitle>
            <SheetDescription>
              Agrega un nuevo servicio a tu portafolio
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Preview */}
          {previewUrl ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Vista Previa</Label>
              <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : null}

          {/* Upload Imagen */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Imagen del Servicio *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={createService.isPending}
              className="w-full gap-2 h-11"
            >
              <Upload className="w-4 h-4" />
              {selectedFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
            </Button>
            {uploadError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                {uploadError}
              </p>
            )}
            {!selectedFile && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                La imagen es requerida
              </p>
            )}
            <p className="text-xs text-slate-500">
              Formatos: JPEG, PNG, WebP, GIF • Máximo: 5MB
            </p>
          </div>

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
            {!title && (
              <p className="text-xs text-slate-500">
                El título es requerido
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug (URL) *
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
            {!slug && (
              <p className="text-xs text-slate-500">
                El slug es requerido (identificador único para la URL)
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción * ({description.length}/2000)
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2.5 border rounded-md resize-y bg-white border-slate-300 text-black text-sm leading-relaxed focus:ring-2 focus:ring-primary"
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
            {!description && (
              <p className="text-xs text-slate-500">
                La descripción es requerida (mínimo 20 caracteres)
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
              placeholder="Ej: Ver más "
            />
          </div>

            {/* Mensaje de validación */}
            {hasValidationErrors() && (
              <div className="text-sm text-amber-600 flex items-center gap-2 -mt-4">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                Por favor completa todos los campos requeridos correctamente
              </div>
            )}

          {/* Actions */}
          <div className="sticky bottom-0 bg-white -mx-6 px-6 py-4 flex gap-3">
            <Button
              onClick={handleCreate}
              disabled={createService.isPending || hasValidationErrors()}
              className="flex-1 h-11"
              variant={'default'}
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
                setCtaText('Ver más')
                setSelectedFile(null)
                setPreviewUrl(null)
                setUploadError(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
                onOpenChange(false)
              }}
              className="h-11"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
