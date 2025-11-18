'use client'

import { useState } from 'react'
import { useServices } from '@/hooks/useServices'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { Plus } from 'lucide-react'
import { ServicesGrid } from './ServicesGrid'
import { ServiceCreateSheet } from './ServiceCreateSheet'

export default function ServicesManager() {
  const { data: services = [], isLoading } = useServices()
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)

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
      <div className="h-full overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-end p-4">
          <Button
            onClick={() => setIsCreateSheetOpen(true)}
            className="gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Agregar Servicio
          </Button>
        </div>

        <div className="px-8 pb-8 -mt-16">
          {/* Grid de Servicios */}
          <div className="bg-white dark:bg-slate-950 rounded-lg overflow-hidden shadow-xl">
            <div className="p-8">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Servicios ({services.length})</h2>

                {services.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No hay servicios. Agrega uno para comenzar.</p>
                  </Card>
                ) : (
                  <ServicesGrid services={services} />
                )}
              </div>
            </div>

            {/* Info Bar */}
            <div className="border-t bg-slate-50 dark:bg-slate-900/50 px-8 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {services.length} servicios disponibles
                </span>
              </div>
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
