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
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header de Sección con Botones */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Imágenes Hero</h1>
              {isReordering && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Modo reordenamiento
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Gestiona las imágenes principales del sitio</p>
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
          <Card className="p-12 text-center bg-white dark:bg-slate-900 shadow-sm">
            <p className="text-muted-foreground">No hay imágenes del hero. Agrega una para comenzar.</p>
          </Card>
        ) : (
          <HeroImagesGrid images={images} isReordering={isReordering} />
        )}
      </div>

      {/* Upload Sheet */}
      <HeroImageUploadSheet
        isOpen={isUploadSheetOpen}
        onOpenChange={setIsUploadSheetOpen}
      />
    </div>
  )
}
