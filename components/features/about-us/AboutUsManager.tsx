'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAboutUsActive, useUpdateAboutUs } from '@/hooks/useAboutUs'
import { aboutUsSchema, type AboutUsFormData } from '@/lib/validations/aboutUs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AboutUsEditorSheet } from './AboutUsEditorSheet'
import { Pencil } from 'lucide-react'

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
      await updateAboutUs.mutateAsync({
        id: aboutUs.id,
        payload: data,
      })
      reset(data)
      setIsSheetOpen(false)
    } catch (error) {
      console.error('Error al actualizar:', error)
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
        <div className="sticky top-0 z-10 flex justify-end p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
          <Button
            onClick={() => setIsSheetOpen(true)}
            className="gap-2 shadow-lg"
          >
            <Pencil className="w-4 h-4" />
            Editar Sección
          </Button>
        </div>

        <div className="px-8 pb-8 -mt-16">
          {/* Preview Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden shadow-xl border">
            <div className="p-8 md:p-16">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Imagen Preview */}
                  <div className="order-2 md:order-1">
                    {previewData?.image_url ? (
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                        <img
                          src={previewData.image_url}
                          alt={previewData.image_alt || 'About Us'}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed">
                        <div className="text-center space-y-2">
                          <p className="text-slate-400 font-medium">Sin imagen</p>
                          <p className="text-xs text-slate-400">Agrega una imagen desde el editor</p>
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
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                      {previewData?.title || 'Título de la sección'}
                    </h2>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <p className="text-lg text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {previewData?.description || 'La descripción de la sección aparecerá aquí...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Bar */}
            <div className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm px-8 py-3">
              <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
