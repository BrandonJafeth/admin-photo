'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ContactMessagesService } from '@/services/contact-messages.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowLeft, CheckCircle, MessageSquare, Archive } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '../ui/textarea'

interface MessageDetailProps {
  messageId: string
}

export default function MessageDetail({ messageId }: MessageDetailProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [responseNote, setResponseNote] = useState('')

  const { data: message, isLoading } = useQuery({
    queryKey: ['contact-message', messageId],
    queryFn: () => ContactMessagesService.getById(messageId),
    refetchOnWindowFocus: true,
  })

  // Mutation para actualizar el estado
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: 'read' | 'archived' | 'responded', notes: string }) =>
      ContactMessagesService.updateStatus(messageId, { status, notes }),
    onSuccess: () => {
      // Invalidar las queries relacionadas para refrescar la UI
      queryClient.invalidateQueries({ queryKey: ['contact-message', messageId] })
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
    },
  })

  // Inicializar notas cuando carga el mensaje
  if (message?.notes && !responseNote) {
    setResponseNote(message.notes)
  }

  const handleStatusUpdate = async (status: 'read' | 'archived' | 'responded') => {
    try {
      await updateStatusMutation.mutateAsync({ status, notes: responseNote })

      toast.success(`Mensaje marcado como ${status === 'read' ? 'leído' :
          status === 'archived' ? 'archivado' : 'respondido'
        }`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Mensaje no encontrado</h2>
        <Button variant="outline" onClick={() => router.push('/mensajes')}>
          Volver a la lista
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/mensajes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl text-black font-bold">Detalle del Mensaje</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>Recibido el {format(new Date(message.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</span>
            <span>•</span>
            <Badge variant={
              message.status === 'pending' ? 'outline' :
                message.status === 'read' ? 'default' :
                  message.status === 'archived' ? 'secondary' : 'default'
            }>
              {message.status === 'pending' ? 'Pendiente' :
                message.status === 'read' ? 'Leído' :
                  message.status === 'archived' ? 'Archivado' : 'Respondido'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido del Mensaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap">
                {message.message}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold block">Servicio de interés:</span>
                  {message.service_type || 'No especificado'}
                </div>
                <div>
                  <span className="font-semibold block">Fecha del evento:</span>
                  {message.event_date ? format(new Date(message.event_date), 'dd/MM/yyyy') : 'No especificada'}
                </div>
                <div>
                  <span className="font-semibold block">Cómo nos encontró:</span>
                  {message.how_found_us || 'No especificado'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestión y Respuesta</CardTitle>
              <CardDescription>
                Registra notas internas o el estado de la respuesta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas internas / Respuesta</label>
                <Textarea
                  placeholder="Escribe aquí notas sobre la llamada o la respuesta enviada..."
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 justify-end border-t pt-4">
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('read')}
                disabled={updateStatusMutation.isPending || message.status === 'read'}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Marcar Leído
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('responded')}
                disabled={updateStatusMutation.isPending || message.status === 'responded'}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                Marcar Respondido
              </Button>
              <Button
                onClick={() => handleStatusUpdate('archived')}
                disabled={updateStatusMutation.isPending || message.status === 'archived'}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                Archivar
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Nombre</span>
                <span className="text-lg font-medium">{message.name}</span>
              </div>
              <Separator />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Email</span>
                <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline break-all">
                  {message.email}
                </a>
              </div>
              <Separator />
              <div>
                <span className="text-sm font-medium text-muted-foreground block">Teléfono</span>
                {message.phone ? (
                  <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">
                    {message.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground italic">No proporcionado</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
