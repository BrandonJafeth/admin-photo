import { useQuery } from '@tanstack/react-query'
import { ServicesService } from '@/services/services.service'
import { PortfolioImagesService } from '@/services/portfolio-images.service'
import { ContactMessagesService } from '@/services/contact-messages.service'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [services, images, messages] = await Promise.all([
        ServicesService.getAll(),
        PortfolioImagesService.getAll(),
        ContactMessagesService.getAll(),
      ])

      return {
        totalServices: services.length,
        totalImages: images.length,
        pendingMessages: messages.filter(m => m.status === 'pending').length,
        recentMessages: messages.slice(0, 5),
      }
    },
  })
}
