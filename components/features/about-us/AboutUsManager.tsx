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
import { AboutUsEditorSheet } from './AboutUsEditorSheet'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

export default function AboutUsManager() {
  const { data: aboutUs, isLoading } = useAboutUsActive()
  const updateAboutUs = useUpdateAboutUs()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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

  const onSubmit = async (data: AboutUsFormData) => {
    if (!aboutUs?.id) return

    try {
      let imageUrl = data.image_url

      // Si la URL es un blob (imagen en memoria), subirla a Cloudinary
      if (imageUrl && imageUrl.startsWith('blob:')) {
        // Convertir blob URL a File
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'about-us-image', { type: blob.type })
        
        // Subir a Cloudinary
        const result = await uploadToCloudinary(file, 'about-us')
        imageUrl = result.url
      }

      await updateAboutUs.mutateAsync({
        id: aboutUs.id,
        payload: {
          ...data,
          image_url: imageUrl,
        },
      })
      reset({
        ...data,
        image_url: imageUrl,
      })
      toast.success('Sobre Nosotros actualizado', {
        description: 'Los cambios se guardaron correctamente',
      })
      setIsSheetOpen(false)
    } catch (error) {
      console.error('Error al actualizar:', error)
      toast.error('Error al actualizar', {
        description: error instanceof Error ? error.message : 'No se pudieron guardar los cambios',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!aboutUs) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No hay información de About Us configurada
        </p>
      </Card>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      {/* Vista Previa - Estilo página real */}
      <div className="h-full overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-end p-4">
          <Button
            onClick={() => setIsSheetOpen(true)}
            className="gap-2 shadow-lg"
          >
            <Pencil className="w-4 h-4" />
            Editar Sección
          </Button>
        </div>

        <div className="px-8 pb-8 -mt-16">
          {/* Preview Section - Estilo Landing */}
          <div className="bg-white dark:bg-slate-950 rounded-lg overflow-hidden shadow-xl">
            <div className="p-8 md:p-12 lg:p-16">
              <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
                  {/* Imagen Preview con Marco Decorativo */}
                  <div className="order-2 md:order-1 flex justify-center">
                    {previewData?.image_url ? (
                      <div className="relative w-full max-w-sm">
                        {/* Marco decorativo exterior */}
                        <div className="absolute -inset-4 border-4 border-black dark:border-white transform -rotate-3"></div>
                        <div className="absolute -inset-2 border-4 border-black dark:border-white"></div>
                        
                        {/* Imagen */}
                        <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-700">
                          <img
                            src={previewData.image_url}
                            alt={previewData.image_alt || 'About Us'}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full max-w-sm">
                        {/* Marco decorativo exterior */}
                        <div className="absolute -inset-4 border-4 border-black dark:border-white transform -rotate-3"></div>
                        <div className="absolute -inset-2 border-4 border-black dark:border-white"></div>
                        
                        <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-400">
                          <div className="text-center space-y-2">
                            <p className="text-slate-400 font-medium">Sin imagen</p>
                            <p className="text-xs text-slate-400">Agrega una imagen desde el editor</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contenido Preview */}
                  <div className="order-1 md:order-2 space-y-6">
                    {!previewData?.is_active && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        Oculto en el sitio
                      </div>
                    )}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                      {previewData?.title || 'Título de la sección'}
                    </h2>
                    <div className="h-1 w-16 bg-slate-900 dark:bg-white"></div>
                    <div className="space-y-4">
                      <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {previewData?.description || 'La descripción de la sección aparecerá aquí...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Bar */}
            <div className="border-t bg-slate-50 dark:bg-slate-900/50 px-8 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Vista previa en tiempo real
                </span>
                <span>Orden de visualización: {previewData?.order ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet Editor */}
      <AboutUsEditorSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={updateAboutUs.isPending}
        isSuccess={updateAboutUs.isSuccess}
        isError={updateAboutUs.isError}
        previewImageUrl={previewData?.image_url}
        previewImageAlt={previewData?.image_alt}
      />
    </div>
  )
}
