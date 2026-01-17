'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Loader2, X } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { useCreatePortfolioImage } from '@/hooks/usePortfolioImages'
import { useImageCategories } from '@/hooks/useImageCategories'
import { useServices } from '@/hooks/useServices'
import { toast } from 'sonner'

const portfolioImageSchema = z.object({
  title: z.union([z.string().max(200, 'El título es demasiado largo'), z.literal('')]).optional(),
  alt: z.string().min(1, 'El texto alternativo es obligatorio').max(200, 'El texto alternativo es demasiado largo'),
  category_id: z.string().min(1, 'Debes seleccionar una categoría'),
  service_id: z.string().optional(),
})

type PortfolioImageFormData = z.infer<typeof portfolioImageSchema>

interface PortfolioImageUploadSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  nextOrder: number
}

export function PortfolioImageUploadSheet({
  isOpen,
  onOpenChange,
  onClose,
  nextOrder,
}: PortfolioImageUploadSheetProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { data: categories = [], isLoading: categoriesLoading } = useImageCategories()
  const { data: services = [], isLoading: servicesLoading } = useServices()
  const createImage = useCreatePortfolioImage()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PortfolioImageFormData>({
    resolver: zodResolver(portfolioImageSchema),
    defaultValues: {
      title: '',
      alt: '',
      category_id: '',
      service_id: 'none',
    },
  })

  const categoryId = watch('category_id')
  const serviceId = watch('service_id')

  const processFile = (file: File) => {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido', {
        description: 'Solo se permiten imágenes JPEG, PNG, WebP o GIF',
      })
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', {
        description: 'El tamaño máximo es 5MB',
      })
      return
    }

    setSelectedFile(file)

    // Generar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const onSubmit = async (data: PortfolioImageFormData) => {
    if (!selectedFile) {
      toast.error('No hay imagen seleccionada', {
        description: 'Por favor selecciona una imagen primero',
      })
      return
    }

    setIsUploading(true)

    try {
      // 1. Subir a Cloudinary
      const result = await uploadToCloudinary(selectedFile, 'gallery')

      // 2. Guardar en base de datos
      await createImage.mutateAsync({
        image_url: result.url,
        thumbnail_url: result.url.replace('/upload/', '/upload/w_400,q_80/'),
        title: data.title || undefined,
        alt: data.alt || undefined,
        category_id: data.category_id,
        service_id: data.service_id === 'none' ? null : data.service_id || null,
        order: nextOrder,
        is_visible: true,
        is_featured: false,
      })

      toast.success('¡Imagen subida!', {
        description: 'La imagen se subió correctamente',
      })

      // Reset y cerrar
      reset()
      setSelectedFile(null)
      setPreviewUrl(null)
      onClose()
    } catch (error) {
      console.error('Error al subir imagen:', error)
      toast.error('Error al subir', {
        description: error instanceof Error ? error.message : 'No se pudo subir la imagen',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const hasValidationErrors = () => {
    return (
      !selectedFile ||
      !watch('alt') ||
      !watch('category_id') ||
      Object.keys(errors).length > 0
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <SheetHeader className="px-6 py-4">
            <SheetTitle className="text-xl">Subir Nueva Imagen</SheetTitle>
            <SheetDescription>
              Completa los detalles de la imagen antes de subirla
            </SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
          {/* Selección de Archivo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Imagen <span className="text-red-500">*</span>
            </Label>

            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                  <p className="text-sm font-medium mb-1">
                    {isDragging ? 'Suelta la imagen aquí' : 'Click para seleccionar o arrastra una imagen'}
                  </p>
                  <p className="text-xs text-slate-500">
                    JPEG, PNG, WebP, GIF • Máximo 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border-2">
                <img
                  src={previewUrl || ''}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 gap-1"
                >
                  <X className="w-4 h-4" />
                  Quitar
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs">
                  {selectedFile.name}
                </div>
              </div>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título ({watch('title')?.length || 0}/200)
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ej: Boda de María y Juan"
            />
            {!watch('title') && (
              <p className="text-xs text-slate-500">Ingresa un título descriptivo para la imagen (opcional)</p>
            )}
            {(watch('title')?.length ?? 0) > 200 && (
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
              Texto Alternativo (Alt) <span className="text-red-500">*</span> ({watch('alt')?.length || 0}/200)
            </Label>
            <Input
              id="alt"
              {...register('alt')}
              placeholder="Descripción para SEO"
            />
            {!watch('alt') && (
              <p className="text-xs text-amber-600">El texto alternativo es obligatorio</p>
            )}
            {(watch('alt')?.length ?? 0) > 200 && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                El texto alternativo es demasiado largo (máximo 200 caracteres)
              </p>
            )}
            {errors.alt && (
              <p className="text-xs text-red-500">{errors.alt.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Describe la imagen para accesibilidad y SEO
            </p>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select
              value={categoryId}
              onValueChange={(value) => setValue('category_id', value)}
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!categoryId && (
              <p className="text-xs text-slate-500">Selecciona la categoría para organizar la imagen</p>
            )}
            {errors.category_id && (
              <p className="text-xs text-red-500">{errors.category_id.message}</p>
            )}
            {categoryId && !errors.category_id && (
              <p className="text-xs text-green-600">Categoría seleccionada</p>
            )}
          </div>

          {/* Servicio (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-medium">
              Servicio (Opcional)
            </Label>
            <Select
              value={serviceId}
              onValueChange={(value) => setValue('service_id', value)}
              disabled={servicesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin vincular a servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin vincular</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Vincula la imagen a un servicio específico
            </p>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-6 px-6 py-4 flex gap-3">
            <Button
              type="submit"
              disabled={isUploading || hasValidationErrors()}
              className="flex-1 h-11"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo...
                </span>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Imagen
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setSelectedFile(null)
                setPreviewUrl(null)
                onClose()
              }}
              disabled={isUploading}
              className="h-11"
            >
              Cancelar
            </Button>
          </div>

          {hasValidationErrors() && (
            <div className="text-sm text-amber-600 flex items-center gap-2 -mt-4">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Por favor completa todos los campos requeridos
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}
