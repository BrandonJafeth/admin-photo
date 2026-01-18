'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Algo salió mal</h2>
          <p className="text-slate-600">
            Ha ocurrido un error inesperado en la aplicación.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-slate-200 rounded text-left overflow-auto max-h-48 text-xs font-mono text-slate-800">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()}>
            Intentar de nuevo
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
