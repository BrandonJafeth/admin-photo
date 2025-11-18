// hooks/useAboutUs.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AboutUsService, type AboutUs, type UpdateAboutUsPayload } from '@/services/aboutUs.service'

/**
 * Hook para obtener todos los registros de About Us
 */
export function useAboutUsList() {
  return useQuery({
    queryKey: ['aboutUs'],
    queryFn: () => AboutUsService.getAll(),
  })
}

/**
 * Hook para obtener el About Us activo
 */
export function useAboutUsActive() {
  return useQuery({
    queryKey: ['aboutUs', 'active'],
    queryFn: () => AboutUsService.getActive(),
  })
}

/**
 * Hook para obtener un About Us por ID
 */
export function useAboutUsById(id: string) {
  return useQuery({
    queryKey: ['aboutUs', id],
    queryFn: () => AboutUsService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook para actualizar un About Us
 */
export function useUpdateAboutUs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAboutUsPayload }) =>
      AboutUsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutUs'] })
    },
  })
}

/**
 * Hook para crear un About Us
 */
export function useCreateAboutUs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<UpdateAboutUsPayload, 'id'>) =>
      AboutUsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutUs'] })
    },
  })
}

/**
 * Hook para eliminar un About Us
 */
export function useDeleteAboutUs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AboutUsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutUs'] })
    },
  })
}
