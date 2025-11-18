import MessageDetail from '@/components/features/MessageDetail'
import { useParams } from 'next/navigation'

export default function MensajeDetallePage() {
  const params = useParams()
  const id = params?.id

  return <MessageDetail id={id} />
}
