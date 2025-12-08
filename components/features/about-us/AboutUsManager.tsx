'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAboutUsActive, useUpdateAboutUs } from '@/hooks/useAboutUs'
import { aboutUsSchema, type AboutUsFormData } from '@/lib/validations/aboutUs'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Upload, Loader2, Eye, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AboutUsManager() {
  const { data: aboutUs, isLoading } = useAboutUsActive()
  const updateAboutUs = useUpdateAboutUs()
  const [isUploading, setIsUploading] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const form = useForm<AboutUsFormData>({
    resolver: zodResolver(aboutUsSchema),
    defaultValues: {
      title: aboutUs?.title || '',
      description: aboutUs?.description || '',
      image_url: aboutUs?.image_url || '',
      image_alt: aboutUs?.image_alt || '',
      is_active: aboutUs?.is_active ?? true,
      order: aboutUs?.order ?? 0,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = form

  // Watch individual fields for live preview (evita re-renders innecesarios)
  const title = watch('title')
  const description = watch('description')
  const image_url = watch('image_url')
  const image_alt = watch('image_alt')
  const is_active = watch('is_active')
  const order = watch('order')

  // Memoize preview data para evitar infinite loop
  const previewData = useMemo(() => ({
    title,
    description,
    image_url,
    image_alt,
    is_active,
    order,
  }), [title, description, image_url, image_alt, is_active, order])

  // Actualizar form cuando los datos de Supabase lleguen
  useEffect(() => {
    if (aboutUs) {
      reset({
        title: aboutUs.title || '',
        description: aboutUs.description || '',
        image_url: aboutUs.image_url || '',
        image_alt: aboutUs.image_alt || '',
        is_active: aboutUs.is_active ?? true,
        order: aboutUs.order ?? 0,
      })
    }
  }, [aboutUs, reset])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Formato inválido', {
        description: 'Solo se permiten archivos de imagen',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagen muy grande', {
        description: 'El tamaño máximo es 5MB',
      })
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadToCloudinary(file, 'about-us')
      setValue('image_url', result.url, { shouldDirty: true })
      setValue('image_alt', file.name.replace(/\.[^/.]+$/, ''), { shouldDirty: true })
      toast.success('Imagen subida correctamente')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir imagen', {
        description: 'No se pudo subir la imagen. Intenta nuevamente.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: AboutUsFormData) => {
    if (!aboutUs?.id) return

    try {
      await updateAboutUs.mutateAsync({
        id: aboutUs.id,
        payload: data,
      })
      reset(data)
      toast.success('Sobre Nosotros actualizado', {
        description: 'Los cambios se guardaron correctamente',
      })
    } catch (error) {
      console.error('Error al actualizar:', error)
      toast.error('Error al actualizar', {
        description: error instanceof Error ? error.message : 'No se pudieron guardar los cambios',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-hidden">
        <div className="h-full overflow-y-auto bg-[#F5F5F7]">
          <div className="p-6">
            <div className="max-w-[1400px] mx-auto space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!aboutUs) {
    return (
      <div className="h-full overflow-hidden">
        <div className="h-full overflow-y-auto bg-[#F5F5F7]">
          <div className="p-6">
            <div className="max-w-[1400px] mx-auto">
              <Card className="p-6">
                <p className="text-center text-slate-600">
                  No hay información de About Us configurada
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto bg-[#F5F5F7]">
        <div className="p-6">
          <div className="max-w-[1400px] mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header de Sección */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Sobre Nosotros</h1>
            <p className="text-sm text-slate-600">Gestiona el contenido principal del sitio web</p>
          </div>
        </div>

        {/* Grid de 2 columnas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna Izquierda - Formulario */}
          <div className="space-y-6">
                  <Card className="p-6 space-y-5 bg-white border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Imagen de la Sección</h2>
                
                <div className="space-y-4">
                  {/* Preview de imagen */}
                  {previewData?.image_url && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-100">
                      <img
                        src={previewData.image_url}
                        alt={previewData.image_alt || 'Preview'}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="space-y-2">
                    <Label className="text-slate-900">Subir Nueva Imagen</Label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
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
                    <p className="text-xs text-slate-600">
                      Formatos: JPEG, PNG, WebP • Máximo: 5MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_alt" className="text-slate-900">Texto Alternativo (SEO)</Label>
                    <Input
                      id="image_alt"
                      {...register('image_alt')}
                      placeholder="Ej: Equipo de trabajo en el estudio"
                    />
                    {errors.image_alt && (
                      <p className="text-xs text-red-500">{errors.image_alt.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
           
          </div>

          {/* Columna Derecha - Vista Previa */}
          <div className="space-y-6">
              <Card className="p-6 space-y-5 bg-white border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Contenido de Texto</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-900">Título de la Sección</Label>
                    {isEditingTitle ? (
                      <div className="space-y-2">
                        <Input
                          id="title"
                          {...register('title')}
                          placeholder="Ej: Sobre Nosotros"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              setIsEditingTitle(false)
                              if (isDirty && aboutUs?.id) {
                                try {
                                  await updateAboutUs.mutateAsync({
                                    id: aboutUs.id,
                                    payload: { title: watch('title'), description: watch('description'), image_url: watch('image_url'), image_alt: watch('image_alt'), is_active: watch('is_active'), order: watch('order') },
                                  })
                                  toast.success('Título actualizado')
                                } catch (error) {
                                  toast.error('Error al actualizar')
                                }
                              }
                            }}
                          >
                            Guardar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingTitle(false)
                              reset()
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md bg-slate-50">
                        <span className="flex-1 text-sm text-slate-900">{watch('title') || 'Haz clic en el lápiz para editar'}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingTitle(true)}
                          className="h-7 w-7 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                    {errors.title && (
                      <p className="text-xs text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-900">
                      Descripción ({watch('description')?.length || 0}/2000)
                    </Label>
                    {isEditingDescription ? (
                      <div className="space-y-2">
                        <textarea
                          id="description"
                          {...register('description')}
                          className="w-full min-h-[200px] px-3 py-2 border border-slate-300 rounded-md resize-y text-sm leading-relaxed text-slate-900 focus:ring-2 focus:ring-[#5B4EEB] focus:border-[#5B4EEB]"
                          placeholder="Cuéntanos sobre tu negocio, tu historia, tus valores..."
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              setIsEditingDescription(false)
                              if (isDirty && aboutUs?.id) {
                                try {
                                  await updateAboutUs.mutateAsync({
                                    id: aboutUs.id,
                                    payload: { title: watch('title'), description: watch('description'), image_url: watch('image_url'), image_alt: watch('image_alt'), is_active: watch('is_active'), order: watch('order') },
                                  })
                                  toast.success('Descripción actualizada')
                                } catch (error) {
                                  toast.error('Error al actualizar')
                                }
                              }
                            }}
                          >
                            Guardar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingDescription(false)
                              reset()
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="px-3 py-2 border border-slate-200 rounded-md bg-slate-50 min-h-[100px] text-sm text-slate-900 whitespace-pre-wrap">
                          {watch('description') || 'Haz clic en el lápiz para editar'}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingDescription(true)}
                          className="absolute top-2 right-2 h-7 w-7 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                    {errors.description && (
                      <p className="text-xs text-red-500">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
