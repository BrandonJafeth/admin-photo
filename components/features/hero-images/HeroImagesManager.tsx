'use client'

import { useState } from 'react'
import { useHeroImages } from '@/hooks/useHeroImages'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { HeroImageUploadSheet } from './HeroImageUploadSheet'
import { Plus, ArrowDownUp, X } from 'lucide-react'
import { HeroImagesGrid } from './HeroImagesGrid'

export default function HeroImagesManager() {
  const { data: images = [], isLoading } = useHeroImages()
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto bg-[#F5F5F7]">
        <div className="p-6">
          <div className="max-w-[1400px] mx-auto">
        {/* Header de Sección con Botones */}
        <div className="flex items-start justify-between gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">Imágenes Hero</h1>
              {isReordering && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Modo reordenamiento
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">Gestiona las imágenes principales del sitio</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={isReordering ? "default" : "outline"}
              onClick={() => setIsReordering(!isReordering)}
              className="gap-2"
            >
              {isReordering ? (
                <>
                  <X className="w-4 h-4" />
                  Terminar
                </>
              ) : (
                <>
                  <ArrowDownUp className="w-4 h-4" />
                  Reordenar
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsUploadSheetOpen(true)}
              disabled={isReordering}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Imagen
            </Button>
          </div>
        </div>

        {/* Grid de Imágenes */}
        {images.length === 0 ? (
          <Card className="p-12 text-center bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-600">No hay imágenes del hero. Agrega una para comenzar.</p>
          </Card>
        ) : (
          <HeroImagesGrid images={images} isReordering={isReordering} />
        )}
          </div>
        </div>
      </div>

      {/* Upload Sheet */}
      <HeroImageUploadSheet
        isOpen={isUploadSheetOpen}
        onOpenChange={setIsUploadSheetOpen}
      />
    </div>
  )
}
