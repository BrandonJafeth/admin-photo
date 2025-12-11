'use client'

import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Briefcase, Image as ImageIcon, MessageSquare, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-[#F5F5F7] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Bienvenido al panel de administración</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Servicios
            </CardTitle>
            <Briefcase className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalServices || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Servicios activos en la plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Mensajes Pendientes
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.pendingMessages || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Mensajes sin responder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Imágenes en Galería
            </CardTitle>
            <ImageIcon className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalImages || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Total de imágenes subidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Mensajes Recientes</h2>
          <Link href="/mensajes">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {stats?.recentMessages?.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              No hay mensajes recientes
            </Card>
          ) : (
            stats?.recentMessages?.map((message) => (
              <Card key={message.id} className="hover:bg-slate-50 transition-colors">
                <div className="p-4 flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    message.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    message.status === 'read' ? 'bg-blue-100 text-blue-600' :
                    message.status === 'responded' ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-slate-900 truncate">{message.name}</h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(message.created_at), "d MMM, HH:mm", { locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-1">{message.message}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
