'use client'

import { useState } from 'react'
import { useServices } from '@/hooks/useServices'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { Plus, ArrowDownUp, X } from 'lucide-react'
import { ServicesGrid } from './ServicesGrid'
import { ServiceCreateSheet } from './ServiceCreateSheet'

export default function ServicesManager() {
  const { data: services = [], isLoading } = useServices()
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      {/* Vista Previa - Estilo página real */}
      <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header de Sección con Botones */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Gestión de Servicios</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Administra los servicios fotográficos que ofreces</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={isReordering ? 'secondary' : 'outline'}
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
              
              {isReordering && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Modo reordenamiento
                </span>
              )}

              <Button
                onClick={() => setIsCreateSheetOpen(true)}
                disabled={isReordering}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Servicio
              </Button>
            </div>
          </div>

          {/* Grid de Servicios */}
          <div>
            <div className="mb-6">

              {services.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-slate-900 shadow-sm">
                  <p className="text-muted-foreground">No hay servicios. Agrega uno para comenzar.</p>
                </Card>
              ) : (
                <ServicesGrid services={services} isReordering={isReordering} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Sheet */}
      <ServiceCreateSheet
        isOpen={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
      />
    </div>
  )
}
