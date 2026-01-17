import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Evitar error en build time si faltan variables (común en CI/CD sin configurar)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Client creation might fail.')
}

/**
 * Cliente Supabase para uso en el cliente (browser)
 * Usamos @supabase/ssr para que maneje las cookies automáticamente
 */
export const supabaseClient = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export default supabaseClient
