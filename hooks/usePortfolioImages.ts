// hooks/usePortfolioImages.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  PortfolioImagesService,
  type PortfolioImage,
  type CreatePortfolioImagePayload,
  type UpdatePortfolioImagePayload,
} from '@/services/portfolio-images.service'

/**
 * Hook para obtener todas las imágenes del portafolio
 */
export function usePortfolioImages() {
  return useQuery({
    queryKey: ['portfolio-images'],
    queryFn: () => PortfolioImagesService.getAll(),
  })
}

/**
 * Hook para obtener las imágenes de un servicio
 */
export function usePortfolioImagesByServiceId(serviceId: string) {
  return useQuery({
    queryKey: ['portfolio-images', 'service', serviceId],
    queryFn: () => PortfolioImagesService.getByServiceId(serviceId),
    enabled: !!serviceId,
  })
}

/**
 * Hook para obtener una imagen por ID
 */
export function usePortfolioImageById(id: string) {
  return useQuery({
    queryKey: ['portfolio-images', id],
    queryFn: () => PortfolioImagesService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook para crear una imagen del portafolio
 */
export function useCreatePortfolioImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePortfolioImagePayload) =>
      PortfolioImagesService.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] })
      if (data.service_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['portfolio-images', 'service', data.service_id] 
        })
      }
    },
  })
}

/**
 * Hook para crear múltiples imágenes del portafolio
 */
export function useCreateManyPortfolioImages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payloads: CreatePortfolioImagePayload[]) =>
      PortfolioImagesService.createMany(payloads),
    onSuccess: (data) => {
      if (data.length > 0 && data[0].service_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['portfolio-images', 'service', data[0].service_id] 
        })
      }
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] })
    },
  })
}

/**
 * Hook para actualizar una imagen del portafolio
 */
export function useUpdatePortfolioImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePortfolioImagePayload }) =>
      PortfolioImagesService.update(id, payload),
    onSuccess: (data) => {
      if (data.service_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['portfolio-images', 'service', data.service_id] 
        })
      }
      queryClient.invalidateQueries({ queryKey: ['portfolio-images', data.id] })
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] })
    },
  })
}

/**
 * Hook para eliminar una imagen del portafolio
 */
export function useDeletePortfolioImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => PortfolioImagesService.delete(id),
    onSuccess: (_, id) => {
      // Invalidar todas las queries de portfolio-images
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] })
    },
  })
}

/**
 * Hook para actualizar el orden de las imágenes
 */
export function useUpdatePortfolioImagesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Array<{ id: string; order: number }>) =>
      PortfolioImagesService.updateOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] })
    },
  })
}

/**
 * Hook para eliminar todas las imágenes de un servicio
 */
export function useDeletePortfolioImagesByServiceId() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (serviceId: string) => 
      PortfolioImagesService.deleteByServiceId(serviceId),
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ 
        queryKey: ['portfolio-images', 'service', serviceId] 
      })
      queryClient.invalidateQueries({ queryKey: ['portfolio-images'] })
    },
  })
}

