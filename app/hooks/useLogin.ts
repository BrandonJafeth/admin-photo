'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signIn, SignInPayload } from '../services/auth.service'

export function useLogin() {
  const router = useRouter()

  return useMutation<unknown, Error, SignInPayload>({
    mutationFn: async (payload: SignInPayload) => {
      return await signIn(payload)
    },
    onSuccess: async () => {
      router.push('/admin')
    },
  })
}
