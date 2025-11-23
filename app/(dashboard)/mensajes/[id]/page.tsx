import MessageDetail from '@/components/features/MessageDetail'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MessageDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  return <MessageDetail messageId={resolvedParams.id} />
}
