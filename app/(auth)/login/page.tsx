"use client"

import React, { useState } from 'react'
import { Eye, EyeOff, Camera, Mail, Lock } from 'lucide-react'
import { useLogin } from '@/hooks/useLogin'
import type { SignInPayload } from '@/services/auth.service'

export default function LoginPage() {
  const [email, setEmail] = useState('adminjoerldsnbds@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const { mutateAsync } = useLogin()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload: SignInPayload = { email, password }
      await mutateAsync(payload)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] relative overflow-hidden">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1A1A1A]" />
      
      {/* Patrón de ruido sutil (opcional) */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      {/* Contenedor del formulario */}
      <div className="relative z-10 w-full max-w-[440px] px-6">
        {/* Contenido */}
        <div className="w-full">
            {/* Logo y branding */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center mb-6">
                <Camera className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-[32px] font-semibold tracking-tight text-white mb-3">
                GADEA ISO
              </h1>
              <p className="text-sm font-medium text-[#999999] tracking-[0.15em] uppercase">
                Panel Administrativo
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-2.5">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-white/90"
                >
                  Correo electrónico
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-white/60 transition-colors z-10">
                    <Mail className="w-[18px] h-[18px]" strokeWidth={2} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@gadeaiso.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-[52px] pl-12 pr-4 bg-[#2A2A2A] border border-[#333333] text-white text-[15px] placeholder:text-[#666666] focus:border-white/30 focus:ring-2 focus:ring-white/10 focus:outline-none rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2.5">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-white/90"
                >
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-white/60 transition-colors z-10">
                    <Lock className="w-[18px] h-[18px]" strokeWidth={2} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-[52px] pl-12 pr-12 bg-[#2A2A2A] border border-[#333333] text-white text-[15px] placeholder:text-[#666666] focus:border-white/30 focus:ring-2 focus:ring-white/10 focus:outline-none rounded-xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white/80 transition-colors focus:outline-none z-10"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" strokeWidth={2} />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Recordarme y Olvidaste contraseña */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-[18px] h-[18px] rounded-md border-[#333333] bg-[#1A1A1A] text-white focus:ring-white/20 focus:ring-offset-0 cursor-pointer transition-colors"
                  />
                  <span className="text-sm text-[#999999] group-hover:text-white/90 transition-colors select-none">
                    Recordarme
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-[#999999] hover:text-white transition-colors focus:outline-none focus:text-white"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Botón de inicio de sesión */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] mt-8 bg-white text-black text-[15px] font-semibold hover:bg-white/90 active:bg-white/80 transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Footer del formulario */}
            <div className="mt-8 pt-6 text-center">
              <p className="text-sm text-[#666666]">
                ¿Necesitas ayuda?{' '}
                <a 
                  href="#" 
                  className="text-[#999999] hover:text-white transition-colors focus:outline-none focus:text-white underline underline-offset-4"
                >
                  Contacta al soporte
                </a>
              </p>
            </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-[#4A4A4A] mt-8 tracking-[0.15em] font-medium">
          © 2025 GADEA ISO
        </p>
      </div>
    </div>
  )
}
