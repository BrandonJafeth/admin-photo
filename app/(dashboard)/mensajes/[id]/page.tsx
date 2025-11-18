'use client'

import MessageDetail from '@/components/features/MessageDetail'
import { useParams } from 'next/navigation'

export default function MensajeDetallePage() {
  const params = useParams()
  const paramId = params?.id
  const id = Array.isArray(paramId) ? paramId[0] : paramId

  return <MessageDetail id={id} />
}
