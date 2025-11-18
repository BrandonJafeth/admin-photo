"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useLogin } from '../../hooks/useLogin'
import type { SignInPayload } from '../../services/auth.service'

export default function LoginPage() {
  const [email, setEmail] = useState('adminjoerldsnbds@gmail.com')
  const [password, setPassword] = useState('')

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
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-card text-card-foreground">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div>
            <Label>Contraseña</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
        </form>
      </Card>
    </div>
  )
}
