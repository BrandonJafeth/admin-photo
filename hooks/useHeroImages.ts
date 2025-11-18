// hooks/useHeroImages.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  HeroImagesService,
  type HeroImage,
  type CreateHeroImagePayload,
  type UpdateHeroImagePayload,
} from '@/services/heroImages.service'

/**
 * Hook para obtener todas las imágenes del hero
 */
export function useHeroImages() {
  return useQuery({
    queryKey: ['heroImages'],
    queryFn: () => HeroImagesService.getAll(),
  })
}

/**
 * Hook para obtener una imagen del hero por ID
 */
export function useHeroImageById(id: string) {
  return useQuery({
    queryKey: ['heroImages', id],
    queryFn: () => HeroImagesService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook para crear una imagen del hero
 */
export function useCreateHeroImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateHeroImagePayload) =>
      HeroImagesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroImages'] })
    },
  })
}

/**
 * Hook para actualizar una imagen del hero
 */
export function useUpdateHeroImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHeroImagePayload }) =>
      HeroImagesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroImages'] })
    },
  })
}

/**
 * Hook para eliminar una imagen del hero
 */
export function useDeleteHeroImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => HeroImagesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroImages'] })
    },
  })
}

/**
 * Hook para actualizar el orden de las imágenes
 */
export function useUpdateHeroImagesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Array<{ id: string; order: number }>) =>
      HeroImagesService.updateOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroImages'] })
    },
  })
}
