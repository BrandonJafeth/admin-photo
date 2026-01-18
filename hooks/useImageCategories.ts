import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageCategoriesService } from '@/services/image-categories.service'

export function useImageCategories() {
  return useQuery({
    queryKey: ['image-categories'],
    queryFn: () => ImageCategoriesService.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateImageCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      ImageCategoriesService.create(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image-categories'] })
    },
  })
}

export function useDeleteImageCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ImageCategoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image-categories'] })
    },
  })
}
