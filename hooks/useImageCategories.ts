import { useQuery } from '@tanstack/react-query'
import { ImageCategoriesService } from '@/services/image-categories.service'

export function useImageCategories() {
  return useQuery({
    queryKey: ['image-categories'],
    queryFn: () => ImageCategoriesService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
