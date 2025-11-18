// hooks/useServices.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ServicesService,
  type Service,
  type CreateServicePayload,
  type UpdateServicePayload,
} from '@/services/services.service'

/**
 * Hook para obtener todos los servicios
 */
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => ServicesService.getAll(),
  })
}

/**
 * Hook para obtener un servicio por ID
 */
export function useServiceById(id: string) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => ServicesService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook para crear un servicio
 */
export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateServicePayload) =>
      ServicesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

/**
 * Hook para actualizar un servicio
 */
export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServicePayload }) =>
      ServicesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

/**
 * Hook para eliminar un servicio
 */
export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ServicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

/**
 * Hook para actualizar el orden de los servicios
 */
export function useUpdateServicesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Array<{ id: string; order: number }>) =>
      ServicesService.updateOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}
