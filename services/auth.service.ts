import supabaseClient from '../lib/supabaseClient'

export interface SignInPayload {
  email: string
  password: string
}

export async function signIn({ email, password }: SignInPayload): Promise<unknown> {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return data
}
