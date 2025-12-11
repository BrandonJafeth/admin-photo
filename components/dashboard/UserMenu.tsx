'use client'

import { useState } from 'react'
import { LogOut, User, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from '../../services/auth.service'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
          <User className="w-5 h-5 text-slate-600" />
        </div>
        <div className="text-left block">
          <p className="text-sm font-medium text-slate-900">Admin</p>
          <p className="text-xs text-slate-500">admin@gadeaiso.com</p>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
            <button
              onClick={() => {
                setIsOpen(false)
                // Navigate to settings if needed
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configuración
            </button>
            
            <div className="border-t border-slate-200 my-1" />
            
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
